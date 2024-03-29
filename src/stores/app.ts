import { acceptHMRUpdate, defineStore } from 'pinia'

import zhLocale from 'element-plus/lib/locale/lang/zh-cn'
import enLocale from 'element-plus/lib/locale/lang/en'

export const useAppStore = defineStore('app', () => {
  /**
   * Current named of the user.
   */
  const locale = ref(zhLocale)
  /**
   * 选择
   */
  const decision = ref('')

  /**
   * Set locale
   * @param value
   */
  async function setLocale(language: 'zh-CN' | 'en') {
    if (language === 'zh-CN')
      locale.value = zhLocale
    else
      locale.value = enLocale
  }

  function decide(value: 'ok' | 'wow' | 'no') {
    decision.value = value
  }

  return {
    decision,
    locale,

    setLocale,
    decide,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
