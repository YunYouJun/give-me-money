import Vue from 'vue'
import VueRouter from 'vue-router'
import i18n from '../i18n'

import Index from '../components/Index.vue'

Vue.use(VueRouter)

const router = new VueRouter({ 
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index,
      meta: {
        title: i18n.t('message.title')
      }
    },
    {
      path: '*',
      redirect: '/'
    }
  ] 
})

router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
})

export default router
