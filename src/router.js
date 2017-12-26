import VueRouter from 'vue-router'

import Home from './components/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: '首页',
    component: Home
  }
]

const router = new VueRouter({ routes: routes });

router.beforeEach((to, from, next) => {
  next();
})

router.afterEach(() => {
  window.scrollTo(0, 0);
})

export default router;
