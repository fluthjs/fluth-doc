export default {
  label: "简体中文",
  lang: "cn",
  title: "fluth",
  description: "类 Promise 的异步流程控制库",
  themeConfig: {
    outline: "deep",
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
            { text: "适用场景", link: "/cn/guide/scene" },
            { text: "使用插件", link: "/cn/guide/plugin" },
            { text: "不可变数据", link: "/cn/guide/immutable" },
            // { text: "高阶用法", link: "/cn/guide/heigh" },
            { text: "typescript支持", link: "/cn/guide/type" },
          ],
        },
        {
          text: "API",
          items: [
            {
              text: "流",
              items: [
                { text: "Stream", link: "/cn/api/stream" },
                { text: "Observable", link: "/cn/api/observable" },
                { text: "createStream", link: "/cn/api/createStream" },
              ],
            },
            {
              text: "操作符",
              items: [
                { text: "fork", link: "/cn/api/operator/fork" },
                { text: "finish", link: "/cn/api/operator/finish" },
                { text: "combine", link: "/cn/api/operator/combine" },
                { text: "concat", link: "/cn/api/operator/concat" },
                { text: "merge", link: "/cn/api/operator/merge" },
                { text: "partition", link: "/cn/api/operator/partition" },
                { text: "promiseAll", link: "/cn/api/operator/promiseAll" },
                { text: "promiseRace", link: "/cn/api/operator/promiseRace" },
              ],
            },
            {
              text: "插件",
              items: [
                {
                  text: "execute插件",
                  items: [
                    { text: "delayExec", link: "/cn/api/plugin/delayExec" },
                    { text: "consoleExec", link: "/cn/api/plugin/consoleExec" },
                  ],
                },
                { text: "then插件", items: [] },
                {
                  text: "chain插件",
                  items: [
                    { text: "delay", link: "/cn/api/plugin/delay" },
                    { text: "throttle", link: "/cn/api/plugin/throttle" },
                    { text: "debounce", link: "/cn/api/plugin/debounce" },
                    { text: "skip", link: "/cn/api/plugin/skip" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};
