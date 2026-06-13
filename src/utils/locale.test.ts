import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_LOCALE,
  getBrowserLocale,
  getInitialLocale,
  getStoredLocale,
  LOCALE_STORAGE_KEY,
  matchSupportedLocale,
  normalizeLocale,
  persistLocale,
} from './locale'

describe('locale utils', () => {
  it('normalizes supported locale values', () => {
    expect(matchSupportedLocale('en-US')).toBe('en')
    expect(matchSupportedLocale('ja-JP')).toBe('ja')
    expect(matchSupportedLocale('zh-Hans-CN')).toBe('zh-CN')
    expect(matchSupportedLocale('fr-FR')).toBeUndefined()
    expect(normalizeLocale('fr-FR')).toBe(DEFAULT_LOCALE)
  })

  it('uses stored locale before browser language', () => {
    const storage = {
      getItem: vi.fn(() => 'zh-CN'),
    }

    expect(getInitialLocale({
      browserLanguageSource: { language: 'en-US', languages: ['en-US'] },
      storage,
    })).toBe('zh-CN')
    expect(storage.getItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY)
  })

  it('uses browser language when no locale is stored', () => {
    expect(getInitialLocale({
      browserLanguageSource: { language: 'en-US', languages: ['ja-JP', 'en-US'] },
      storage: { getItem: () => null },
    })).toBe('ja')
  })

  it('falls back to Chinese for unsupported browser languages', () => {
    expect(getBrowserLocale({ language: 'fr-FR', languages: ['fr-FR'] })).toBe('zh-CN')
  })

  it('ignores unavailable storage reads and writes', () => {
    expect(getStoredLocale({
      getItem: () => {
        throw new Error('blocked')
      },
    })).toBeUndefined()

    expect(() => persistLocale('en', {
      setItem: () => {
        throw new Error('blocked')
      },
    })).not.toThrow()
  })
})
