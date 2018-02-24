
import Vue from 'vue'
import VueI18n from 'vue-i18n'

import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import ElementLocale from 'element-ui/lib/locale'

Vue.use(VueI18n)

const messages = {
  en: {
    message: {
      title: 'Give Me Money!',
      'give-me-alipay': 'Dear brother, can you give me your alipay?',
      header: 'Lovely Loli',
      ok: 'OK ! Give you !',
      no: 'Nooooo!',
      alipay: {
        account: 'Alipay Account',
        password: 'Alipy Password',
        pin: 'Alipay Pin'
      },
      'be-serious': '(σ‘・д・)σ Please be serious!',
      cry: '〒▽〒 WuWuWu……',
      thank: '(o゜ω゜o) Thank you, darling!'
    },
    prompt: {
      alipay: {
        account: 'Please givr me your alipay account ~',
        password: 'And alipay password ~',
        pin: 'And alipay pin ~'
      },
      ok: '{value} brothers have told us !',
      no: 'We have been rejected {value} times !'
    },
    enLocale
  },
  'zh-CN': {
    message: {
      title: '我很可爱，请给我钱！',
      'give-me-alipay': '欧尼酱，可以……告诉我……你的……支付宝吗？',
      header: '可爱的萝莉妹妹们',
      ok: '好的，给你!',
      no: '残忍拒绝',
      alipay: {
        account: '支付宝账号',
        password: '支付宝密码',
        pin: '交易密码'
      },
      'be-serious': '(σ‘・д・)σ 给我认真填啦!',
      cry: '〒▽〒 呜呜呜~',
      thank: '(o゜ω゜o) 谢谢欧尼酱!'
    },
    prompt: {
      alipay: {
        account: '请给我支付宝账号~',
        password: '还有支付宝密码~',
        pin: '以及交易密码~'
      },
      ok: '已经有 {value} 个欧尼酱告诉我啦！',
      no: '已被残忍拒绝 {value} 次！'
    },
    zhLocale
  }
}

localStorage.getItem('lang')

const i18n =  new VueI18n({
  locale: localStorage.getItem('lang')?localStorage.getItem('lang'):'zh-CN', // set locale
  messages
})

ElementLocale.i18n((key, value) => i18n.t(key, value))

export default i18n
