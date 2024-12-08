export default {
  label: "简体中文",
  lang: "cn",
  title: "fluth",
  description: "基于 Promise 的异步流程控制库",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "指南", link: "/cn/guide/introduce" },
      { text: "API", link: "/cn/api/stream" },
      { text: "changelog", link: "https://github.com/fluthjs/fluth/blob/master/CHANGELOG.md" },
      { text: "fluth-vue", link: "https://fluthjs.github.io/fluth-vue/index.html" },
    ],
    sidebar: {
      "/cn/": [
        {
          text: "指南",
          items: [
            { text: "简介", link: "/cn/guide/introduce" },
            { text: "基本概念", link: "/cn/guide/base" },
            { text: "快速开始", link: "/cn/guide/quick" },
            { text: "高阶用法", link: "/cn/guide/heigh" },
          ],
        },
        {
          text: "API",
          items: [
            { text: "流", link: "/cn/api/stream" },
            {
              text: "操作符",
              items: [
                { text: "pipe", link: "/cn/api/operator/pipe" },
                { text: "fork", link: "/cn/api/operator/fork" },
                { text: "finish", link: "/cn/api/operator/finish" },
                { text: "combine", link: "/cn/api/operator/combine" },
                { text: "concat", link: "/cn/api/operator/concat" },
                { text: "merge", link: "/cn/api/operator/merge" },
                { text: "partition", link: "/cn/api/operator/partition" },
                { text: "race", link: "/cn/api/operator/race" },
              ],
            },
          ],
        },
      ],
    },
  },
};
