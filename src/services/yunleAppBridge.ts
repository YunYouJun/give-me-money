import type { CloudbaseSession } from './cloudbase'
import { getCloudbaseConfig } from './cloudbaseConfig'

type YunleAppReason = 'not_in_app' | 'unsupported' | 'not_authenticated' | 'invalid_request' | 'exchange_failed'

export interface YunleAppSessionResult {
  ok: boolean
  reason?: YunleAppReason
  session?: CloudbaseSession
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function createNonce(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function readSession(value: unknown): CloudbaseSession | undefined {
  if (!isRecord(value))
    return undefined
  const accessToken = readString(value.access_token)
  const refreshToken = readString(value.refresh_token)
  if (!accessToken || !refreshToken)
    return undefined

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: value.user,
  }
}

function getBridge(): YunleAppBridge | undefined {
  return typeof window === 'undefined' ? undefined : window.ylf
}

function getAuthCodeFunction(bridge: YunleAppBridge) {
  return bridge.getAuthCode ?? bridge.login
}

function classifyBridgeError(error: unknown): YunleAppReason {
  const message = error instanceof Error ? error.message : String(error || '')
  if (message.includes('login required') || message.includes('not_authenticated'))
    return 'not_authenticated'
  return 'invalid_request'
}

export function isYunleAppBridgeAvailable(): boolean {
  const bridge = getBridge()
  return bridge?.inYunleApp === true && typeof getAuthCodeFunction(bridge) === 'function'
}

export async function requestYunleAppSession(): Promise<YunleAppSessionResult> {
  if (typeof window === 'undefined')
    return { ok: false, reason: 'not_in_app' }

  const bridge = getBridge()
  if (bridge?.inYunleApp !== true)
    return { ok: false, reason: 'not_in_app' }

  const getAuthCode = getAuthCodeFunction(bridge)
  if (typeof getAuthCode !== 'function')
    return { ok: false, reason: 'unsupported' }

  let code: string | null = null
  try {
    const result = await getAuthCode({
      nonce: createNonce(),
      scope: ['profile', 'cloudbase:session'],
    })
    code = readString(result?.code)
  }
  catch (error) {
    return { ok: false, reason: classifyBridgeError(error) }
  }

  if (!code)
    return { ok: false, reason: 'invalid_request' }

  const config = getCloudbaseConfig()
  const url = new URL('/api/jsapi/auth/exchange', config.appAuthOrigin)
  let response: Response
  try {
    response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        origin: window.location.origin,
      }),
    })
  }
  catch {
    return { ok: false, reason: 'exchange_failed' }
  }
  if (!response.ok)
    return { ok: false, reason: response.status === 401 || response.status === 403 ? 'not_authenticated' : 'exchange_failed' }

  let payload: unknown
  try {
    payload = await response.json()
  }
  catch {
    return { ok: false, reason: 'invalid_request' }
  }
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null
  const session = readSession(data?.session)
  if (!session)
    return { ok: false, reason: 'invalid_request' }

  return { ok: true, session }
}
