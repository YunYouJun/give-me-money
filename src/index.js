import app from './app.vue'
import router from './router'

import './index.css'

window.onload = function(){
  new Vue({
    router,
    el: 'app',
    components: {
      app
    }
  });
}
