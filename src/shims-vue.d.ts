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
  VITE_YUNLE_SSO_ORIGIN?: string
  VITE_YUNLE_APP_AUTH_ORIGIN?: string
  VITE_GMM_APP_ID?: string
}

interface YunleAppAuthCodeResult {
  code: string
  expiresIn?: number
  scope?: string[]
}

interface YunleAppBridge {
  version?: number
  inYunleApp?: boolean
  getAuthCode?: (options?: { scope?: string[] | string, nonce?: string }) => Promise<YunleAppAuthCodeResult>
  login?: (options?: { scope?: string[] | string, nonce?: string }) => Promise<YunleAppAuthCodeResult>
}

declare interface Window {
  localStorage: Storage
  ylf?: YunleAppBridge
}
