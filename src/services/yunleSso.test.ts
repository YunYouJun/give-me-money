import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureCloudbaseClient } from './cloudbase'
import {
  ensureYunleCloudbaseSession,
  getYunleLoginUrl,
  getYunleSsoUrl,
  redirectToYunleLogin,
} from './yunleSso'

vi.mock('./cloudbase', () => ({
  ensureCloudbaseClient: vi.fn(),
}))

function asMock<T extends (...args: never[]) => unknown>(fn: T) {
  return fn as unknown as Mock
}

beforeEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
  asMock(ensureCloudbaseClient).mockReturnValue({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-1',
              is_anonymous: false,
            },
          },
        },
        error: null,
      }),
      setSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-1',
              is_anonymous: false,
            },
          },
        },
        error: null,
      }),
    },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('yunle sso', () => {
  it('builds login and sso URLs against www.yunle.fun by default', () => {
    expect(getYunleLoginUrl()).toBe('https://www.yunle.fun/login')
    expect(getYunleSsoUrl({
      mode: 'interactive',
      nonce: 'nonce-1',
      targetOrigin: 'https://gmm.yunle.fun',
    })).toBe('https://www.yunle.fun/auth/sso?mode=interactive&targetOrigin=https%3A%2F%2Fgmm.yunle.fun&nonce=nonce-1')
  })

  it('syncs a matching SSO message into the CloudBase session', async () => {
    let openedUrl = ''
    const popup = {
      closed: false,
      close: vi.fn(),
    } as unknown as Window
    vi.spyOn(window, 'open').mockImplementation((url) => {
      openedUrl = String(url)
      return popup
    })

    const promise = ensureYunleCloudbaseSession({ mode: 'interactive', timeoutMs: 1000 })
    expect(window.open).toHaveBeenCalled()

    const nonce = new URL(openedUrl).searchParams.get('nonce')
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        nonce,
        ok: true,
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          user: {
            id: 'user-1',
            is_anonymous: false,
          },
        },
        type: 'ylf:sso-result',
      },
      origin: 'https://www.yunle.fun',
      source: popup,
    }))

    await expect(promise).resolves.toEqual(expect.objectContaining({
      userId: 'user-1',
    }))
    expect(asMock(ensureCloudbaseClient).mock.results[0]?.value.auth.setSession).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    })
  })

  it('rejects an SSO message when CloudBase does not expose a real session after sync', async () => {
    asMock(ensureCloudbaseClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: {}, error: null }),
        setSession: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    })

    let openedUrl = ''
    const popup = {
      closed: false,
      close: vi.fn(),
    } as unknown as Window
    vi.spyOn(window, 'open').mockImplementation((url) => {
      openedUrl = String(url)
      return popup
    })

    const promise = ensureYunleCloudbaseSession({ mode: 'interactive', timeoutMs: 1000 })
    const nonce = new URL(openedUrl).searchParams.get('nonce')
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        nonce,
        ok: true,
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          user: {
            id: 'user-1',
            is_anonymous: false,
          },
        },
        type: 'ylf:sso-result',
      },
      origin: 'https://www.yunle.fun',
      source: popup,
    }))

    await expect(promise).resolves.toBe(null)
  })

  it('redirects to the YunLe login page', () => {
    const assign = vi.fn()
    vi.stubGlobal('location', {
      ...window.location,
      assign,
    })

    redirectToYunleLogin()

    expect(assign).toHaveBeenCalledWith('https://www.yunle.fun/login')
  })
})
