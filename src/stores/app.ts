import type { AppLocale } from '~/utils/locale'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { getInitialLocale } from '~/utils/locale'

export const useAppStore = defineStore('app', () => {
  const language = shallowRef<AppLocale>(getInitialLocale())
  const decision = shallowRef('')

  async function setLocale(value: AppLocale) {
    language.value = value
  }

  function decide(value: 'ok' | 'wow' | 'no') {
    decision.value = value
  }

  return {
    decide,
    decision,
    language,
    setLocale,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
