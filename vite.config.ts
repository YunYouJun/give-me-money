import path from "path";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";
import ViteIcons, { ViteIconsResolver } from "vite-plugin-icons";
import ViteComponents from "vite-plugin-components";
import Markdown from "vite-plugin-md";
import WindiCSS from "vite-plugin-windicss";
import { VitePWA } from "vite-plugin-pwa";
import VueI18n from "@intlify/vite-plugin-vue-i18n";
import styleImport from "vite-plugin-style-import";

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

    styleImport({
      libs: [
        {
          libraryName: "element-plus",
          esModule: true,
          ensureStyleFile: true,
          resolveStyle: name => {
            name = name.slice(3);
            return `element-plus/packages/theme-chalk/src/${name}.scss`;
          },
          resolveComponent: name => {
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
        // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
        // Remember old renderer, if overridden, or proxy to default renderer
        const defaultRender =
          md.renderer.rules.link_open ||
          function(tokens: any, idx: any, options: any, env: any, self: any) {
            return self.renderToken(tokens, idx, options);
          };

        md.renderer.rules.link_open = function(
          tokens: any,
          idx: string | number,
          options: any,
          env: any,
          self: any,
        ) {
          const hrefIndex = tokens[idx].attrIndex("href");
          const href = tokens[idx].attrs[hrefIndex][1];
          if (href.startsWith("http://") || href.startsWith("https://")) {
            // If you are sure other plugins can't add `target` - drop check below
            const aIndex = tokens[idx].attrIndex("target");

            if (aIndex < 0) {
              tokens[idx].attrPush(["target", "_blank"]); // add new attribute
            } else {
              tokens[idx].attrs[aIndex][1] = "_blank"; // replace value of existing attr
            }
          }

          // pass token to default renderer.
          return defaultRender(tokens, idx, options, env, self);
        };
      },
    }),

    // https://github.com/antfu/vite-plugin-components
    ViteComponents({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],

      // allow auto import and register components used in markdown
      customLoaderMatcher: id => id.endsWith(".md"),

      globalComponentsDeclaration: true,

      // auto import icons
      customComponentResolvers: [
        // https://github.com/antfu/vite-plugin-icons
        ViteIconsResolver({
          // enabledCollections: ['carbon']
        }),
      ],
    }),

    // https://github.com/antfu/vite-plugin-icons
    ViteIcons(),

    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      safelist: "prose prose-sm m-auto text-left",
    }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Give Me Money!",
        short_name: "Money!",
        theme_color: "#000000",
        icons: [
          {
            src: "/money.png",
            sizes: "200x200",
            type: "image/png",
          },
        ],
      },
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
