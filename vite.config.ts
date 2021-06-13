import path from "path";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";
import ViteIcons, { ViteIconsResolver } from "vite-plugin-icons";
import ViteComponents from "vite-plugin-components";

import Markdown from "vite-plugin-md";
import Prism from "markdown-it-prism";
import LinkAttributes from "markdown-it-link-attributes";

import WindiCSS from "vite-plugin-windicss";
import VueI18n from "@intlify/vite-plugin-vue-i18n";
import StyleImport from "vite-plugin-style-import";

export default defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
    },
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),

    StyleImport({
      libs: [
        {
          libraryName: "element-plus",
          esModule: true,
          ensureStyleFile: true,
          resolveStyle: (name) => {
            name = name.slice(3);
            // return `element-plus/packages/theme-chalk/src/${name}.scss`;
            // return `element-theme-ink/src/${name}.scss`;
            return `element-theme-ink/dist/${name}.css`;
          },
          resolveComponent: (name) => {
            return `element-plus/lib/${name}`;
          },
        },
      ],
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ["vue", "md"],
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/antfu/vite-plugin-md
    Markdown({
      wrapperClasses: "prose prose-sm m-auto text-left",
      headEnabled: true,

      markdownItSetup(md) {
        md.use(Prism);
        md.use(LinkAttributes, {
          pattern: /^https?:\/\//,
          attrs: {
            target: "_blank",
            rel: "noopener",
          },
        });
      },
    }),

    // https://github.com/antfu/vite-plugin-components
    ViteComponents({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],

      // allow auto import and register components used in markdown
      customLoaderMatcher: (id) => id.endsWith(".md"),

      // auto import icons
      customComponentResolvers: [
        // https://github.com/antfu/vite-plugin-icons
        ViteIconsResolver(),
      ],
    }),

    // https://github.com/antfu/vite-plugin-icons
    ViteIcons(),

    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      safelist: "prose prose-sm m-auto text-left",
    }),

    // https://github.com/intlify/vite-plugin-vue-i18n
    VueI18n({
      include: [path.resolve(__dirname, "locales/**")],
    }),
  ],

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: "async",
    formatting: "minify",
  },

  optimizeDeps: {
    include: ["vue", "vue-router", "@vueuse/core"],
    exclude: ["vue-demi"],
  },
});
