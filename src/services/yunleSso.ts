import type { CloudbaseSession } from './cloudbase'
import { getCloudbaseConfig } from './cloudbaseConfig'

type SsoMode = 'silent' | 'interactive'
type SsoReason = 'invalid_request' | 'not_authenticated' | 'popup_blocked' | 'popup_closed' | 'timeout'

export interface YunleSsoResult {
  ok: boolean
  reason?: SsoReason
  session?: CloudbaseSession
}

interface YunleSsoMessage {
  type: 'ylf:sso-result'
  ok: boolean
  nonce: string
  reason?: 'invalid_request' | 'not_authenticated'
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

function readMessage(value: unknown): YunleSsoMessage | null {
  if (!isRecord(value) || value.type !== 'ylf:sso-result')
    return null

  const nonce = readString(value.nonce)
  if (!nonce)
    return null

  const reason = value.reason === 'invalid_request' || value.reason === 'not_authenticated'
    ? value.reason
    : undefined

  return {
    type: 'ylf:sso-result',
    ok: value.ok === true,
    nonce,
    reason,
    session: readSession(value.session),
  }
}

function buildSsoUrl(mode: SsoMode, nonce: string): string {
  const config = getCloudbaseConfig()
  const url = new URL('/auth/sso', config.ssoOrigin)
  url.searchParams.set('mode', mode)
  url.searchParams.set('targetOrigin', window.location.origin)
  url.searchParams.set('nonce', nonce)
  return url.toString()
}

function openSsoTarget(mode: SsoMode, url: string): { targetWindow: Window | null, cleanup: () => void, blocked?: boolean } {
  if (mode === 'interactive') {
    const width = 560
    const height = 720
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)
    const popup = window.open(
      url,
      'yunle_sso',
      `width=${width},height=${height},left=${left},top=${top},popup=yes`,
    )
    return {
      targetWindow: popup,
      cleanup: () => undefined,
      blocked: !popup,
    }
  }

  const iframe = document.createElement('iframe')
  iframe.src = url
  iframe.title = 'YunLeFun SSO'
  iframe.style.position = 'fixed'
  iframe.style.width = '1px'
  iframe.style.height = '1px'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'
  iframe.style.border = '0'
  iframe.style.left = '-100px'
  iframe.style.top = '-100px'
  document.body.appendChild(iframe)

  return {
    targetWindow: iframe.contentWindow,
    cleanup: () => iframe.remove(),
  }
}

export function requestYunleSso(mode: SsoMode): Promise<YunleSsoResult> {
  if (typeof window === 'undefined')
    return Promise.resolve({ ok: false, reason: 'invalid_request' })

  const config = getCloudbaseConfig()
  const nonce = createNonce()
  const target = openSsoTarget(mode, buildSsoUrl(mode, nonce))
  if (target.blocked || !target.targetWindow)
    return Promise.resolve({ ok: false, reason: 'popup_blocked' })

  const timeoutMs = mode === 'interactive' ? 120_000 : 15_000

  return new Promise((resolve) => {
    let settled = false
    let popupTimer: number | undefined
    let timeoutTimer: number | undefined

    function cleanup() {
      window.removeEventListener('message', onMessage)
      if (timeoutTimer)
        window.clearTimeout(timeoutTimer)
      if (popupTimer)
        window.clearInterval(popupTimer)
      target.cleanup()
    }

    function settle(result: YunleSsoResult) {
      if (settled)
        return
      settled = true
      cleanup()
      resolve(result)
    }

    function onMessage(event: MessageEvent<unknown>) {
      if (event.origin !== config.ssoOrigin)
        return
      if (event.source !== target.targetWindow)
        return

      const message = readMessage(event.data)
      if (!message || message.nonce !== nonce)
        return

      if (!message.ok) {
        settle({ ok: false, reason: message.reason || 'not_authenticated' })
        return
      }

      if (!message.session) {
        settle({ ok: false, reason: 'invalid_request' })
        return
      }

      settle({ ok: true, session: message.session })
    }

    timeoutTimer = window.setTimeout(() => {
      settle({ ok: false, reason: 'timeout' })
    }, timeoutMs)

    if (mode === 'interactive') {
      popupTimer = window.setInterval(() => {
        if (target.targetWindow?.closed)
          settle({ ok: false, reason: 'popup_closed' })
      }, 500)
    }

    window.addEventListener('message', onMessage)
  })
}
