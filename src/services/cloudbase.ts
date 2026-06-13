import cloudbase from '@cloudbase/js-sdk/app'
import { getCloudbaseConfig } from './cloudbaseConfig'
import '@cloudbase/js-sdk/database'

export type { CloudbaseConfig } from './cloudbaseConfig'

type CloudbaseApp = ReturnType<typeof cloudbase.init>
type CloudbaseDb = ReturnType<CloudbaseApp['database']>

interface CloudbaseClient {
  app: CloudbaseApp
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
  })

  const db = app.database()
  cachedClient = { app, db }
  return cachedClient
}

export function ensureCloudbaseClient(): CloudbaseClient {
  const client = getCloudbaseClient()
  if (!client)
    throw new Error('CloudBase 尚未配置，请补充云乐坊环境的 Publishable Key。')
  return client
}
