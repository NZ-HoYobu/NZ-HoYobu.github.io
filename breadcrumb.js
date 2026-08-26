const pageTree = {
    "index.html": { title: "南山大学HoYoverse同好会", isIndex: true },
    "member.html": { title: "メンバー概要" },
    "useful-info": {
        "giEngNames.html": { title: "原神英語名" },
        "hsrEngNames.html": { title: "スターレイル英語名" },
        "zzzEngNames.html": { title: "ゼンゼロ英語名" },
        "list.html": { title: "便利情報一覧", isIndex: true },
    },
};

function generateBreadcrumbs(pageTree) {
    // 1. 現在のURLからパスを抽出し、配列に分解
    const pathname = window.location.pathname;
    const pathSegments = pathname.split("/").filter((segment) => segment !== "");

    const breadcrumbs = [];
    let currentTree = pageTree;

    const rootIndexKey = Object.keys(pageTree).find((key) => pageTree[key] && pageTree[key].isIndex);

    if (rootIndexKey) {
        breadcrumbs.push({
            title: pageTree[rootIndexKey].title,
            url: `/${rootIndexKey}`,
        });
    } else {
        throw new Error("トップページが指定されていません。pageTree直下にisIndexを持つ要素が必要です。");
    }

    let accumulatedPath = "";

    for (const segment of pathSegments) {
        accumulatedPath += `/${segment}`;

        // すでに同じURLが追加されている場合はスキップ
        if (breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].url === accumulatedPath) {
            if (currentTree && currentTree[segment]) currentTree = currentTree[segment];
            continue;
        }

        // オブジェクトツリー内に該当キーが存在するか確認
        if (currentTree && currentTree[segment]) {
            const node = currentTree[segment];

            if (node.title) {
                breadcrumbs.push({
                    title: node.title,
                    url: accumulatedPath,
                });
            } else {
                let title = segment;
                let targetUrl = accumulatedPath;

                const indexKey = Object.keys(node).find((key) => node[key] && node[key].isIndex);
                if (indexKey) {
                    title = node[indexKey].title;
                    targetUrl += `/${indexKey}`;
                }
                breadcrumbs.push({
                    title: title,
                    url: targetUrl,
                });

                // 次のループのためにツリーの参照を下位階層に進める
                currentTree = node;
            }
        }
    }

    return breadcrumbs;
}

const observer = new MutationObserver((mutations, obs) => {
    const targetElement = document.getElementById("breadcrumb");
    if (targetElement) {
        console.log("要素が見つかりました");
        const breadcrumbContainer = document.getElementById("breadcrumb");
        const breadcrumbs = generateBreadcrumbs(pageTree);

        // 生成されたパンくずリストをDOMに追加
        const htmlSegments = breadcrumbs.map((crumb, index) => {
            if (index === breadcrumbs.length - 1) {
                return `<span class="breadcrumb-current">${crumb.title}</span>`;
            }
            return `<a href="${crumb.url}" class="breadcrumb-link">${crumb.title}</a>`;
        });
        breadcrumbContainer.innerHTML = htmlSegments.join(" &gt; ");
        setTimeout(() => {
            breadcrumbContainer.scrollLeft = breadcrumbContainer.scrollWidth;
        }, 100);
        // パンくずリストを複数回生成されることは通常ない
        obs.disconnect();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
