const DEFAULT_ENV_ID = 'yunlefun-8g7ybcxc7345c490'
const DEFAULT_REGION = 'ap-shanghai'

export interface CloudbaseConfig {
  envId: string
  region: string
  accessKey: string
  isConfigured: boolean
}

export function getCloudbaseConfig(): CloudbaseConfig {
  const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID || DEFAULT_ENV_ID
  const region = import.meta.env.VITE_CLOUDBASE_REGION || DEFAULT_REGION
  const accessKey = import.meta.env.VITE_CLOUDBASE_ACCESS_KEY || ''

  return {
    envId,
    region,
    accessKey,
    isConfigured: Boolean(envId && region && accessKey),
  }
}

export function isCloudbaseReady(): boolean {
  return getCloudbaseConfig().isConfigured
}
