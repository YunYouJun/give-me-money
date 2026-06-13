import cloudbase from '@cloudbase/js-sdk/app'
import { getCloudbaseConfig } from './cloudbaseConfig'
import '@cloudbase/js-sdk/auth'
import '@cloudbase/js-sdk/database'

export type { CloudbaseConfig } from './cloudbaseConfig'

type CloudbaseApp = ReturnType<typeof cloudbase.init>
type CloudbaseDb = ReturnType<CloudbaseApp['database']>
type CloudbaseAuth = ReturnType<CloudbaseApp['auth']>

interface CloudbaseClient {
  app: CloudbaseApp
  auth: CloudbaseAuth
  db: CloudbaseDb
}

let cachedClient: CloudbaseClient | null = null

export function getCloudbaseClient(): CloudbaseClient | null {
  if (typeof window === 'undefined')
    return null

  if (cachedClient)
    return cachedClient

  const config = getCloudbaseConfig()
  if (!config.isConfigured)
    return null

  const app = cloudbase.init({
    env: config.envId,
    region: config.region,
    accessKey: config.accessKey,
    auth: {
      detectSessionInUrl: true,
    },
  })

  const auth = app.auth({ persistence: 'local' })
  const db = app.database()
  cachedClient = { app, auth, db }
  return cachedClient
}

export function ensureCloudbaseClient(): CloudbaseClient {
  const client = getCloudbaseClient()
  if (!client)
    throw new Error('CloudBase 尚未配置，请补充云乐坊环境的 Publishable Key。')
  return client
}
