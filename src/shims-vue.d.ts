declare module '*.vue' {
  import type { ComponentOptions } from 'vue'

  const component: ComponentOptions
  export default component
}

// with unplugin-vue-markdown, markdowns can be treat as Vue components
declare module '*.md' {
  import type { ComponentOptions } from 'vue'

  const component: ComponentOptions
  export default component
}

interface ImportMetaEnv {
  VITE_CLOUDBASE_ENV_ID?: string
  VITE_CLOUDBASE_REGION?: string
  VITE_CLOUDBASE_ACCESS_KEY?: string
  VITE_GMM_COMMENTS_URL?: string
}

declare interface Window {
  localStorage: Storage
}
