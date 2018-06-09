
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

import en from './en'
import zh from './zh-CN'

Vue.use(VueI18n)

const messages = {
  en: Object.assign(en, enLocale),
  'zh-CN': Object.assign(zh, zhLocale)
}

const i18n =  new VueI18n({
  locale: localStorage.getItem('lang') ? localStorage.getItem('lang') : 'zh-CN', // set locale
  messages,
})

export default i18n
