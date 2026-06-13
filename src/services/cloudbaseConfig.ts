const DEFAULT_ENV_ID = 'yunlefun-8g7ybcxc7345c490'
const DEFAULT_REGION = 'ap-shanghai'
const DEFAULT_SSO_ORIGIN = 'https://www.yunle.fun'
const DEFAULT_APP_AUTH_ORIGIN = 'https://apps.yunle.fun'
const DEFAULT_APP_ID = 'give-me-money'

export interface CloudbaseConfig {
  envId: string
  region: string
  accessKey: string
  ssoOrigin: string
  appAuthOrigin: string
  appId: string
  isConfigured: boolean
}

function readOrigin(value: string, fallback: string): string {
  try {
    return new URL(value).origin
  }
  catch {
    return fallback
  }
}

export function getCloudbaseConfig(): CloudbaseConfig {
  const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID || DEFAULT_ENV_ID
  const region = import.meta.env.VITE_CLOUDBASE_REGION || DEFAULT_REGION
  const accessKey = import.meta.env.VITE_CLOUDBASE_ACCESS_KEY || ''
  const ssoOrigin = readOrigin(import.meta.env.VITE_YUNLE_SSO_ORIGIN || DEFAULT_SSO_ORIGIN, DEFAULT_SSO_ORIGIN)
  const appAuthOrigin = readOrigin(
    import.meta.env.VITE_YUNLE_APP_AUTH_ORIGIN || DEFAULT_APP_AUTH_ORIGIN,
    DEFAULT_APP_AUTH_ORIGIN,
  )
  const appId = import.meta.env.VITE_GMM_APP_ID || DEFAULT_APP_ID

  return {
    envId,
    region,
    accessKey,
    ssoOrigin,
    appAuthOrigin,
    appId,
    isConfigured: Boolean(envId && region && accessKey),
  }
}

export function isCloudbaseReady(): boolean {
  return getCloudbaseConfig().isConfigured
}
