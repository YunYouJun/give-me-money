import path from 'node:path'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'

import LinkAttributes from 'markdown-it-link-attributes'
import Prism from 'markdown-it-prism'

import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'

import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import { VitePWA } from 'vite-plugin-pwa'

import Layouts from 'vite-plugin-vue-layouts-next'

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

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
    }),

    // https://github.com/dishait/vite-plugin-vue-layouts-next
    Layouts(),

    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
      ],
      dts: false,
    }),

    Components({
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: false,
      resolvers: [
        IconsResolver({
          prefix: 'i',
          enabledCollections: ['carbon', 'mdi', 'ri'],
        }),
      ],
    }),

    Icons({
      compiler: 'vue3',
      autoInstall: false,
    }),

    // https://github.com/unocss/unocss
    UnoCSS(),

    // https://github.com/unplugin/unplugin-vue-markdown
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: markdownWrapperClasses,
      headEnabled: true,
      markdownUses: [
        // https://prismjs.com/
        Prism as never,
        [
          LinkAttributes as never,
          {
            pattern: /^https?:\/\//,
            attrs: {
              target: '_blank',
              rel: 'noopener',
            },
          },
        ],
      ],
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
    include: ['vue', 'vue-router'],
    exclude: ['vue-demi'],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@cloudbase/js-sdk/'))
            return 'cloudbase'
          if (id.includes('/node_modules/vue/')
            || id.includes('/node_modules/vue-router/')
            || id.includes('/node_modules/pinia/')) {
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },

  ssr: {
    // TODO: workaround until they support native ESM
    noExternal: ['workbox-window', /vue-i18n/],
  },
})
