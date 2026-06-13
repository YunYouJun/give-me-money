import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { isYunleAppBridgeAvailable, requestYunleAppSession } from './yunleAppBridge'

vi.mock('./cloudbaseConfig', () => ({
  getCloudbaseConfig: () => ({
    appAuthOrigin: 'https://apps.yunle.fun',
    appId: 'give-me-money',
    envId: 'yunlefun-8g7ybcxc7345c490',
    isConfigured: true,
    region: 'ap-shanghai',
    ssoOrigin: 'https://www.yunle.fun',
  }),
}))

const originalYlf = window.ylf

afterEach(() => {
  window.ylf = originalYlf
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('requestYunleAppSession', () => {
  it('detects unavailable App bridge without touching network', async () => {
    window.ylf = undefined
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    expect(isYunleAppBridgeAvailable()).toBe(false)
    await expect(requestYunleAppSession()).resolves.toEqual({
      ok: false,
      reason: 'not_in_app',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('requests an auth code and exchanges it for a CloudBase session', async () => {
    const getAuthCode = vi.fn(async () => ({
      code: 'one-time-code',
      expiresIn: 300,
      scope: ['profile', 'cloudbase:session'],
    }))
    window.ylf = {
      getAuthCode,
      inYunleApp: true,
      version: 3,
    }

    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({
      data: {
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          user: { id: 'uid-1' },
        },
      },
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(requestYunleAppSession()).resolves.toEqual({
      ok: true,
      session: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: { id: 'uid-1' },
      },
    })
    expect(getAuthCode).toHaveBeenCalledWith(expect.objectContaining({
      scope: ['profile', 'cloudbase:session'],
    }))
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://apps.yunle.fun/api/jsapi/auth/exchange',
      expect.objectContaining({
        body: JSON.stringify({
          code: 'one-time-code',
          origin: window.location.origin,
        }),
        method: 'POST',
      }),
    )
  })

  it('maps host login failures to not_authenticated', async () => {
    window.ylf = {
      getAuthCode: vi.fn(async () => {
        throw new Error('login required')
      }),
      inYunleApp: true,
      version: 3,
    }

    await expect(requestYunleAppSession()).resolves.toEqual({
      ok: false,
      reason: 'not_authenticated',
    })
  })
})
