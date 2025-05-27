export default {
  label: "English",
  lang: "en",
  title: "fluth",
  description: "A Promise-based asynchronous flow control library",
  themeConfig: {
    outline: "deep",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Guide", link: "/en/guide/introduce" },
      { text: "API", link: "/en/api/stream" },
      { text: "changelog", link: "https://github.com/fluthjs/fluth/blob/master/CHANGELOG.md" },
      { text: "fluth-vue", link: "https://fluthjs.github.io/fluth-vue/index.html" },
    ],
    sidebar: {
      "/en/": [
        {
          text: "Guide",
          items: [
            { text: "Introduction", link: "/en/guide/introduce" },
            { text: "Basic Concepts", link: "/en/guide/base" },
            { text: "Quick Start", link: "/en/guide/quick" },
            { text: "Application Scenarios", link: "/en/guide/scene" },
            { text: "Using Plugins", link: "/en/guide/plugin" },
            { text: "Immutable Data", link: "/en/guide/immutable" },
            { text: "TypeScript Support", link: "/en/guide/type" },
          ],
        },
        {
          text: "API",
          items: [
            {
              text: "Streams",
              items: [
                { text: "Stream", link: "/en/api/stream" },
                { text: "Observable", link: "/en/api/observable" },
                { text: "createStream", link: "/en/api/createStream" },
              ],
            },
            {
              text: "Operators",
              items: [
                { text: "fork", link: "/en/api/operator/fork" },
                { text: "finish", link: "/en/api/operator/finish" },
                { text: "combine", link: "/en/api/operator/combine" },
                { text: "concat", link: "/en/api/operator/concat" },
                { text: "merge", link: "/en/api/operator/merge" },
                { text: "partition", link: "/en/api/operator/partition" },
                { text: "race", link: "/en/api/operator/race" },
              ],
            },
            {
              text: "Plugins",
              items: [
                { text: "delayExec", link: "/en/api/plugin/delayExec" },
                { text: "consoleExec", link: "/en/api/plugin/consoleExec" },
                { text: "delay", link: "/en/api/plugin/delay" },
                { text: "throttle", link: "/en/api/plugin/throttle" },
                { text: "debounce", link: "/en/api/plugin/debounce" },
              ],
            },
          ],
        },
      ],
    },
  },
};
