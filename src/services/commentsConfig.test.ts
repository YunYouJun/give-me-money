import { describe, expect, it, vi } from 'vitest'
import { getCommentsUrl } from './commentsConfig'

describe('commentsConfig', () => {
  it('defaults to the Give Me Money app comments page', () => {
    vi.stubEnv('VITE_GMM_COMMENTS_URL', '')

    expect(getCommentsUrl()).toBe('https://apps.yunle.fun/app/give-me-money')
  })

  it('allows overriding the comments URL', () => {
    vi.stubEnv('VITE_GMM_COMMENTS_URL', 'https://example.com/app/comments')

    expect(getCommentsUrl()).toBe('https://example.com/app/comments')
  })

  it('falls back when the override is invalid', () => {
    vi.stubEnv('VITE_GMM_COMMENTS_URL', 'not a url')

    expect(getCommentsUrl()).toBe('https://apps.yunle.fun/app/give-me-money')
  })
})
