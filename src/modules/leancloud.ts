import AV from 'leancloud-storage'
import type { UserModule } from '~/types'

// leancloud

interface LeancloudConfig {
  appId: string
  appKey: string
  serverURL?: string
}

const config: LeancloudConfig = {
  appId: import.meta.env.VITE_APP_ID || '',
  appKey: import.meta.env.VITE_APP_KEY || '',
}

if (import.meta.env.VITE_SERVER_URL)
  config.serverURL = import.meta.env.VITE_SERVER_URL

if (config.appId && config.appKey)
  AV.init(config)

export const install: UserModule = ({ app }) => {
  app.config.globalProperties.$AV = AV
}
