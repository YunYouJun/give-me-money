import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { requestYunleSso } from './yunleSso'

vi.mock('./cloudbaseConfig', () => ({
  getCloudbaseConfig: () => ({
    appId: 'give-me-money',
    envId: 'yunlefun-8g7ybcxc7345c490',
    isConfigured: true,
    region: 'ap-shanghai',
    ssoOrigin: 'https://www.yunle.fun',
  }),
}))

function createPopup() {
  return {
    closed: false,
  } as Window
}

function readOpenedUrl(openSpy: ReturnType<typeof vi.spyOn>) {
  const rawUrl = openSpy.mock.calls[0]?.[0]
  if (typeof rawUrl !== 'string')
    throw new TypeError('SSO popup URL was not opened.')
  return new URL(rawUrl)
}

function dispatchSsoMessage(source: Window, origin: string, data: unknown) {
  const event = new MessageEvent('message', { data, origin })
  Object.defineProperty(event, 'source', { value: source })
  window.dispatchEvent(event)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('requestYunleSso', () => {
  it('opens interactive SSO with target origin and nonce, then accepts valid session messages', async () => {
    const popup = createPopup()
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(popup)

    const resultPromise = requestYunleSso('interactive')
    const url = readOpenedUrl(openSpy)
    const nonce = url.searchParams.get('nonce')

    expect(url.origin).toBe('https://www.yunle.fun')
    expect(url.pathname).toBe('/auth/sso')
    expect(url.searchParams.get('mode')).toBe('interactive')
    expect(url.searchParams.get('targetOrigin')).toBe(window.location.origin)
    expect(nonce).toBeTruthy()

    dispatchSsoMessage(popup, 'https://www.yunle.fun', {
      nonce,
      ok: true,
      session: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: { id: 'uid-1' },
      },
      type: 'ylf:sso-result',
    })

    await expect(resultPromise).resolves.toEqual({
      ok: true,
      session: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: { id: 'uid-1' },
      },
    })
  })

  it('ignores spoofed origin and nonce messages', async () => {
    vi.useFakeTimers()
    const popup = createPopup()
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(popup)

    const resultPromise = requestYunleSso('interactive')
    const url = readOpenedUrl(openSpy)
    const nonce = url.searchParams.get('nonce')

    dispatchSsoMessage(popup, 'https://evil.example', {
      nonce,
      ok: true,
      session: {
        access_token: 'bad',
        refresh_token: 'bad',
      },
      type: 'ylf:sso-result',
    })
    dispatchSsoMessage(popup, 'https://www.yunle.fun', {
      nonce: 'wrong-nonce',
      ok: true,
      session: {
        access_token: 'bad',
        refresh_token: 'bad',
      },
      type: 'ylf:sso-result',
    })

    await vi.advanceTimersByTimeAsync(120_000)
    await expect(resultPromise).resolves.toEqual({
      ok: false,
      reason: 'timeout',
    })
  })

  it('reports popup blockers without mutating session state', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null)

    await expect(requestYunleSso('interactive')).resolves.toEqual({
      ok: false,
      reason: 'popup_blocked',
    })
  })
})
