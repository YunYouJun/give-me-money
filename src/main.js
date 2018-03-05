import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import router from './router'
import i18n from './i18n'

Vue.config.productionTip = false

Vue.use(ElementUI)

const appId = 'FAfX0KW7tIrVPwKjeiCay2IQ-gzGzoHsz';
const appKey = 'MbP9J5vK56e1J7RKmiX9DYlq';
AV.init({ appId, appKey });

new Vue({
  el: '#app',
  router,
  render: h => h(App),
  i18n
})
