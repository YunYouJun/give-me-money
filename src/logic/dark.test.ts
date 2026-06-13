import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COLOR_SCHEME_STORAGE_KEY,
  DARK_THEME_COLOR,
  getPreferredDark,
  getStoredColorScheme,
  LIGHT_THEME_COLOR,
  resolveColorScheme,
  syncDocumentTheme,
  syncThemeFromBrowser,
} from './dark'

function stubPreferredColorScheme(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })))
}

beforeEach(() => {
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')
  document.head.innerHTML = '<meta name="theme-color" content="#fffaf0">'
  localStorage.clear()
})

describe('dark mode logic', () => {
  it('resolves auto color scheme from browser preference', () => {
    expect(resolveColorScheme('auto', true)).toBe('dark')
    expect(resolveColorScheme('auto', false)).toBe('light')
    expect(resolveColorScheme('dark', false)).toBe('dark')
    expect(resolveColorScheme('light', true)).toBe('light')
  })

  it('falls back to auto when storage is unavailable or invalid', () => {
    const blockedStorage = {
      getItem() {
        throw new Error('blocked')
      },
    }

    expect(getStoredColorScheme({ getItem: () => 'dark' })).toBe('dark')
    expect(getStoredColorScheme({ getItem: () => 'sepia' })).toBe('auto')
    expect(getStoredColorScheme(blockedStorage)).toBe('auto')
  })

  it('reads preferred dark mode through matchMedia', () => {
    stubPreferredColorScheme(true)

    expect(getPreferredDark(window)).toBe(true)
  })

  it('syncs document class, color scheme and theme-color meta', () => {
    syncDocumentTheme('dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(DARK_THEME_COLOR)

    syncDocumentTheme('light')

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(LIGHT_THEME_COLOR)
  })

  it('uses stored preference over browser preference when syncing from browser', () => {
    stubPreferredColorScheme(true)
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'light')

    expect(syncThemeFromBrowser(window)).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(LIGHT_THEME_COLOR)
  })
})
