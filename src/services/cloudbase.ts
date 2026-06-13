import cloudbase from '@cloudbase/js-sdk/app'
import { getCloudbaseConfig } from './cloudbaseConfig'
import '@cloudbase/js-sdk/auth'
import '@cloudbase/js-sdk/database'

export type { CloudbaseConfig } from './cloudbaseConfig'

type CloudbaseApp = ReturnType<typeof cloudbase.init>
type CloudbaseAuth = ReturnType<CloudbaseApp['auth']>
type CloudbaseDb = ReturnType<CloudbaseApp['database']>

interface CloudbaseClient {
  app: CloudbaseApp
  auth: CloudbaseAuth
  db: CloudbaseDb
}

export interface CloudbaseUser {
  id: string
  login: string | null
  email: string | null
  phone: string | null
  nickname: string
  avatar: string | null
  isAnonymous: boolean
}

export interface CloudbaseSession {
  access_token?: string
  refresh_token?: string
  user?: unknown
}

let cachedClient: CloudbaseClient | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

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
    persistence: 'local',
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

function mapCloudbaseUser(value: unknown): CloudbaseUser | null {
  if (!isRecord(value))
    return null

  const metadata = isRecord(value.user_metadata) ? value.user_metadata : {}
  const id = readString(value.id)
  if (!id)
    return null

  const login = readString(metadata.username)
  const email = readString(value.email)
  const phone = readString(value.phone)
  const nickname = readString(metadata.nickName)
    || readString(metadata.name)
    || login
    || email
    || phone
    || '云乐坊用户'

  return {
    id,
    login,
    email,
    phone,
    nickname,
    avatar: readString(metadata.avatarUrl) || readString(metadata.picture),
    isAnonymous: value.is_anonymous === true,
  }
}

function readSession(value: unknown): CloudbaseSession | null {
  if (!isRecord(value))
    return null

  return {
    access_token: readString(value.access_token) || undefined,
    refresh_token: readString(value.refresh_token) || undefined,
    user: value.user,
  }
}

function readAuthError(value: unknown): string | null {
  if (!isRecord(value))
    return null
  return readString(value.message)
}

export async function getCurrentUser(): Promise<CloudbaseUser | null> {
  const client = getCloudbaseClient()
  if (!client)
    return null

  const result = await client.auth.getSession()
  const errorMessage = readAuthError(result.error)
  if (errorMessage)
    throw new Error(errorMessage)

  const session = readSession(result.data?.session)
  if (!session)
    return null

  const user = mapCloudbaseUser(session.user)
  if (!user || user.isAnonymous)
    return null

  return user
}

export async function setCurrentSession(session: CloudbaseSession): Promise<CloudbaseUser | null> {
  const client = ensureCloudbaseClient()
  if (!session.access_token || !session.refresh_token)
    throw new Error('云乐坊登录态无效，请重新登录。')

  const result = await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
  const errorMessage = readAuthError(result.error)
  if (errorMessage)
    throw new Error(errorMessage)

  return getCurrentUser()
}

export async function signOutCloudbase(): Promise<void> {
  const client = getCloudbaseClient()
  if (!client)
    return
  await client.auth.signOut()
}
