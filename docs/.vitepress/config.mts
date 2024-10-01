import { defineConfig } from "vitepress";

import cnConfig from "./config.cn.mjs";
import enConfig from "./config.en.mjs";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/fluth-doc/",
  locales: {
    en: enConfig,
    cn: cnConfig,
  },
  markdown: {
    theme: "github-dark",
  },
  head: [
    ["link", { rel: "icon", href: "/fluth-doc/favicon.ico" }],
    ["link", { rel: "icon", href: "/fluth-doc/logo.svg", sizes: "any", type: "image/svg+xml" }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    socialLinks: [{ icon: "github", link: "https://github.com/vuejs/vitepress" }],
  },
});
