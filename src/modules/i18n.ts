import type { Locale } from 'vue-i18n'
import type { UserModule } from '~/types'
import type { AppLocale } from '~/utils/locale'
import { createI18n } from 'vue-i18n'
import { getInitialLocale, normalizeLocale, SUPPORTED_LOCALES } from '~/utils/locale'

// Import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
//
// Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
const i18n = createI18n({
  legacy: false,
  locale: '',
  messages: {},
})

const localesMap = Object.fromEntries(
  Object.entries(import.meta.glob('../../locales/*.yml'))
    .map(([path, loadLocale]) => [path.match(/([\w-]*)\.yml$/)?.[1], loadLocale]),
) as Record<Locale, () => Promise<{ default: Record<string, string> }>>

export const availableLocales = SUPPORTED_LOCALES

const loadedLanguages: string[] = []

function setI18nLanguage(lang: AppLocale) {
  i18n.global.locale.value = lang as any
  if (typeof document !== 'undefined')
    document.querySelector('html')?.setAttribute('lang', lang)
  return lang
}

export async function loadLanguageAsync(lang: string): Promise<AppLocale> {
  const normalizedLang = normalizeLocale(lang)

  // If the same language
  if (i18n.global.locale.value === normalizedLang)
    return setI18nLanguage(normalizedLang)

  // If the language was already loaded
  if (loadedLanguages.includes(normalizedLang))
    return setI18nLanguage(normalizedLang)

  // If the language hasn't been loaded yet
  const messages = await localesMap[normalizedLang]()
  i18n.global.setLocaleMessage(normalizedLang, messages.default)
  loadedLanguages.push(normalizedLang)
  return setI18nLanguage(normalizedLang)
}

export const install: UserModule = async ({ app }) => {
  app.use(i18n)
  await loadLanguageAsync(getInitialLocale())
}
