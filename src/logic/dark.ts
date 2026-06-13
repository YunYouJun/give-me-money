import { useDark, useToggle } from '@vueuse/core'

export const COLOR_SCHEME_STORAGE_KEY = 'vueuse-color-scheme'
export const LIGHT_THEME_COLOR = '#fffaf0'
export const DARK_THEME_COLOR = '#101817'

type ColorScheme = 'dark' | 'light'
type StoredColorScheme = ColorScheme | 'auto'

export function resolveColorScheme(setting: string | null, prefersDark: boolean): ColorScheme {
  return setting === 'dark' || (prefersDark && setting !== 'light') ? 'dark' : 'light'
}

export function getStoredColorScheme(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): StoredColorScheme {
  try {
    const value = storage?.getItem(COLOR_SCHEME_STORAGE_KEY)
    return value === 'dark' || value === 'light' ? value : 'auto'
  }
  catch {
    return 'auto'
  }
}

export function getPreferredDark(win: Pick<Window, 'matchMedia'> | undefined = globalThis.window): boolean {
  return !!win?.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function syncDocumentTheme(scheme: ColorScheme, doc: Document | undefined = globalThis.document) {
  if (!doc)
    return

  const isDarkMode = scheme === 'dark'
  doc.documentElement.classList.toggle('dark', isDarkMode)
  doc.documentElement.classList.toggle('light', !isDarkMode)
  doc.documentElement.style.colorScheme = scheme

  const themeColor = doc.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  themeColor?.setAttribute('content', isDarkMode ? DARK_THEME_COLOR : LIGHT_THEME_COLOR)
}

export function syncThemeFromBrowser(
  win: Pick<Window, 'localStorage' | 'matchMedia'> | undefined = globalThis.window,
  doc: Document | undefined = globalThis.document,
) {
  const scheme = resolveColorScheme(getStoredColorScheme(win?.localStorage), getPreferredDark(win))
  syncDocumentTheme(scheme, doc)
  return scheme
}

export const isDark = useDark({
  storageKey: COLOR_SCHEME_STORAGE_KEY,
  valueDark: 'dark',
  valueLight: 'light',
  onChanged(isDarkMode, defaultHandler, mode) {
    defaultHandler(mode)
    syncDocumentTheme(isDarkMode ? 'dark' : 'light')
  },
})
export const toggleDark = useToggle(isDark)
