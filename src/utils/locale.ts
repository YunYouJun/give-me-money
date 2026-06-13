export const DEFAULT_LOCALE = 'zh-CN'
export const LOCALE_STORAGE_KEY = 'lang'
export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'ja'] as const

export type AppLocale = typeof SUPPORTED_LOCALES[number]

interface LocaleStorageReader {
  getItem: (key: string) => string | null
}

interface LocaleStorageWriter {
  setItem: (key: string, value: string) => void
}

interface BrowserLanguageSource {
  language?: string
  languages?: readonly string[]
}

function getLocaleStorage(): Storage | undefined {
  return typeof localStorage === 'undefined' ? undefined : localStorage
}

function getBrowserLanguageSource(): BrowserLanguageSource | undefined {
  return typeof navigator === 'undefined' ? undefined : navigator
}

export function matchSupportedLocale(value: string | null | undefined): AppLocale | undefined {
  if (!value)
    return undefined

  const normalized = value.toLowerCase()
  if (normalized === 'en' || normalized.startsWith('en-'))
    return 'en'
  if (normalized === 'ja' || normalized.startsWith('ja-'))
    return 'ja'
  if (normalized === 'zh' || normalized.startsWith('zh-'))
    return 'zh-CN'

  return undefined
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  return matchSupportedLocale(value) ?? DEFAULT_LOCALE
}

export function getStoredLocale(storage: LocaleStorageReader | undefined = getLocaleStorage()): AppLocale | undefined {
  try {
    return matchSupportedLocale(storage?.getItem(LOCALE_STORAGE_KEY))
  }
  catch {
    return undefined
  }
}

export function getBrowserLocale(source: BrowserLanguageSource | undefined = getBrowserLanguageSource()): AppLocale {
  const languages = [
    ...source?.languages ?? [],
    source?.language,
  ]

  for (const language of languages) {
    const matchedLocale = matchSupportedLocale(language)
    if (matchedLocale)
      return matchedLocale
  }

  return DEFAULT_LOCALE
}

export function getInitialLocale(options: {
  browserLanguageSource?: BrowserLanguageSource
  storage?: LocaleStorageReader
} = {}): AppLocale {
  return getStoredLocale(options.storage) ?? getBrowserLocale(options.browserLanguageSource)
}

export function persistLocale(
  locale: AppLocale,
  storage: LocaleStorageWriter | undefined = getLocaleStorage(),
) {
  try {
    storage?.setItem(LOCALE_STORAGE_KEY, locale)
  }
  catch {}
}
