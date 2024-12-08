export default {
  label: "English",
  lang: "en",
  title: "fluth",
  description: "A Promise-based asynchronous flow control library",
  themeConfig: {
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
            { text: "Advanced Usage", link: "/en/guide/heigh" },
          ],
        },
        {
          text: "API",
          items: [
            { text: "Stream", link: "/en/api/stream" },
            {
              text: "Operators",
              items: [
                { text: "pipe", link: "/en/api/operator/pipe" },
                { text: "fork", link: "/en/api/operator/fork" },
                { text: "finish", link: "/en/api/operator/finish" },
                { text: "combine", link: "/en/api/operator/combine" },
                { text: "concat", link: "/en/api/operator/concat" },
                { text: "merge", link: "/en/api/operator/merge" },
                { text: "partition", link: "/en/api/operator/partition" },
                { text: "race", link: "/en/api/operator/race" },
              ],
            },
          ],
        },
      ],
    },
  },
};
