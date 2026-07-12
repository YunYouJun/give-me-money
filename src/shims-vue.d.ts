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

declare module '*.yml' {
  import type { LocaleMessage, VueMessageType } from 'vue-i18n'

  const messages: LocaleMessage<VueMessageType>
  export default messages
}

interface ImportMetaEnv {
  VITE_CLOUDBASE_ENV_ID?: string
  VITE_CLOUDBASE_REGION?: string
  VITE_CLOUDBASE_ACCESS_KEY?: string
  VITE_GMM_COMMENTS_URL?: string
  VITE_YUNLE_ORIGIN?: string
  VITE_YUNLE_SSO_ORIGIN?: string
  VITE_YUNLE_APP_AUTH_ORIGIN?: string
}

declare interface Window {
  localStorage: Storage
}
