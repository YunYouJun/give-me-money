import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'

import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'

import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Markdown from 'vite-plugin-md'
import Prism from 'markdown-it-prism'
import UnoCSS from 'unocss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// import VitePluginElementPlus from "vite-plugin-element-plus";

import LinkAttributes from 'markdown-it-link-attributes'

const markdownWrapperClasses = 'text-center'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },

  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),

    // VitePluginElementPlus({
    //   // 如果你需要使用 [component name].scss 源文件，你需要把下面的注释取消掉。
    //   // 对于所有的 API 你可以参考 https://github.com/element-plus/vite-plugin-element-plus
    //   // 的文档注释
    //   // useSource: true,
    //   // 开发时使用 esm，打包时使用 cjs
    //   format: mode === "development" ? "esm" : "cjs",
    // }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@vueuse/head',
        '@vueuse/core',
      ],
      dts: true,
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
    // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: 'src/components.d.ts',
    }),

    // https://github.com/unocss/unocss
    UnoCSS(),

    // https://github.com/antfu/vite-plugin-md
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: markdownWrapperClasses,
      headEnabled: true,
      markdownItSetup(md) {
        // https://prismjs.com/
        md.use(Prism)
        md.use(LinkAttributes, {
          pattern: /^https?:\/\//,
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })
      },
    }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: '请给我钱',
        short_name: '给我钱',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/favicon.png',
            sizes: '200x200',
            type: 'image/png',
          },
        ],
      },
    }),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [path.resolve(__dirname, 'locales/**')],
    }),
  ],

  server: {
    fs: {
      strict: true,
    },
  },

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
  },

  optimizeDeps: {
    include: ['vue', 'vue-router', '@vueuse/core'],
    exclude: ['vue-demi'],
  },

  ssr: {
    // TODO: workaround until they support native ESM
    noExternal: ['workbox-window', /vue-i18n/],
  },
})
