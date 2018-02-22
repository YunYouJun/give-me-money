import Vue from 'vue'
import VueRouter from 'vue-router'

import Index from '../components/Index.vue'

Vue.use(VueRouter)

const router = new VueRouter({ 
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '*',
      redirect: '/'
    }
  ] 
})

export default router
