import type { SsoSession, SsoSetSessionAuth } from '@yunlefun/sso'
import { adoptSession, buildSsoRequestUrl, requestSso } from '@yunlefun/sso'

const DEFAULT_YUNLE_ORIGIN = 'https://www.yunle.fun'
const DEFAULT_SILENT_TIMEOUT_MS = 5000
const DEFAULT_INTERACTIVE_TIMEOUT_MS = 120000

export type YunleSsoMode = 'interactive' | 'silent'

export interface YunleSsoSession {
  access_token?: unknown
  accessToken?: unknown
  refresh_token?: unknown
  refreshToken?: unknown
  user?: unknown
}

export interface YunleCloudbaseSession {
  session: YunleSsoSession
  userId: string
}

interface RequestYunleSsoSessionOptions {
  mode?: YunleSsoMode
  timeoutMs?: number
}

interface BuildYunleSsoUrlOptions {
  mode: YunleSsoMode
  nonce: string
  targetOrigin: string
}

interface CloudbaseSessionAuth {
  getSession?: () => Promise<unknown>
  setCredentials?: (credentials: Record<string, string>) => Promise<unknown>
  setSession?: (params: Record<string, string>) => Promise<unknown>
}

interface NormalizedSsoSession extends SsoSession {
  access_token: string
  refresh_token: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeOrigin(value: string): string {
  try {
    const url = new URL(value)
    if (url.protocol === 'http:' || url.protocol === 'https:')
      return url.origin
  }
  catch {}

  return DEFAULT_YUNLE_ORIGIN
}

function readToken(session: YunleSsoSession, snakeKey: keyof YunleSsoSession, camelKey: keyof YunleSsoSession): string {
  return readString(session[snakeKey]) || readString(session[camelKey])
}

function normalizeSsoSession(session: YunleSsoSession): NormalizedSsoSession | null {
  const accessToken = readToken(session, 'access_token', 'accessToken')
  const refreshToken = readToken(session, 'refresh_token', 'refreshToken')
  if (!accessToken || !refreshToken)
    return null

  return {
    ...session,
    access_token: accessToken,
    refresh_token: refreshToken,
  }
}

function readSessionUserId(session: YunleSsoSession): string | null {
  const user = session.user
  if (!isRecord(user) || readBoolean(user.is_anonymous))
    return null

  const id = user.id
  if (typeof id !== 'string' && typeof id !== 'number')
    return null

  const userId = String(id).trim()
  return userId || null
}

function hasAnonymousUser(session: YunleSsoSession): boolean {
  return isRecord(session.user) && readBoolean(session.user.is_anonymous)
}

function readCloudbaseUserId(result: unknown): string | null {
  if (!isRecord(result))
    return null

  const data = result.data
  if (!isRecord(data))
    return null

  const session = data.session
  const user = isRecord(session) && isRecord(session.user) ? session.user : data.user
  if (!isRecord(user) || readBoolean(user.is_anonymous))
    return null

  const id = user.id
  if (typeof id !== 'string' && typeof id !== 'number')
    return null

  const userId = String(id).trim()
  return userId || null
}

export function getYunleOrigin(): string {
  return normalizeOrigin(
    import.meta.env.VITE_YUNLE_ORIGIN
      || import.meta.env.VITE_YUNLE_SSO_ORIGIN
      || import.meta.env.VITE_YUNLE_APP_AUTH_ORIGIN
      || DEFAULT_YUNLE_ORIGIN,
  )
}

export function getYunleLoginUrl(): string {
  return new URL('/login', getYunleOrigin()).toString()
}

export function redirectToYunleLogin() {
  if (typeof window === 'undefined')
    return

  window.location.assign(getYunleLoginUrl())
}

export function getYunleSsoUrl(options: BuildYunleSsoUrlOptions): string {
  return buildSsoRequestUrl({
    mode: options.mode,
    nonce: options.nonce,
    ssoOrigin: getYunleOrigin(),
    targetOrigin: options.targetOrigin,
  })
}

export async function setCloudbaseSessionFromYunle(session: YunleSsoSession): Promise<string | null> {
  if (hasAnonymousUser(session))
    return null

  const sessionUserId = readSessionUserId(session)
  const normalizedSession = normalizeSsoSession(session)
  if (!normalizedSession)
    return null

  const { ensureCloudbaseClient } = await import('./cloudbase')
  const { auth } = ensureCloudbaseClient()
  const sessionAuth = auth as CloudbaseSessionAuth

  if (typeof sessionAuth.setSession === 'function') {
    await adoptSession(sessionAuth as SsoSetSessionAuth, normalizedSession)
  }
  else if (typeof sessionAuth.setCredentials === 'function') {
    await sessionAuth.setCredentials({
      access_token: normalizedSession.access_token,
      refresh_token: normalizedSession.refresh_token,
    })
  }
  else {
    throw new TypeError('当前 CloudBase SDK 不支持写入云乐坊登录态。')
  }

  if (typeof sessionAuth.getSession === 'function')
    return readCloudbaseUserId(await sessionAuth.getSession())

  return sessionUserId
}

export function requestYunleSsoSession(options: RequestYunleSsoSessionOptions = {}): Promise<YunleSsoSession | null> {
  const mode = options.mode || 'silent'
  const timeoutMs = options.timeoutMs ?? (mode === 'interactive' ? DEFAULT_INTERACTIVE_TIMEOUT_MS : DEFAULT_SILENT_TIMEOUT_MS)

  return requestSso({
    mode,
    ssoOrigin: getYunleOrigin(),
    timeoutMs,
  }).then(result => result.ok ? result.session : null)
}

export async function ensureYunleCloudbaseSession(options: RequestYunleSsoSessionOptions = {}): Promise<YunleCloudbaseSession | null> {
  const session = await requestYunleSsoSession(options)
  if (!session)
    return null

  const userId = await setCloudbaseSessionFromYunle(session)
  if (!userId)
    return null

  return { session, userId }
}
