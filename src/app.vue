<template>
  <div id="app">
    <el-header>
      <navbar></navbar>
    </el-header>
  
    <el-main>
      <router-view/>
    </el-main>

    <el-footer>
      <vue-about-me :copyright="copyright"></vue-about-me>
    </el-footer>
  </div>
</template>

<script>
import Navbar from './components/common/Navbar'
import VueAboutMe from 'vue-about-me'
export default {
  name: 'App',
  components: {
    Navbar,
    VueAboutMe
  },
  data () {
    return {
      header: '可爱的萝莉妹妹们',
      msg: '欧尼酱，可以……告诉我……你的……支付宝吗？',
      copyright: {
        name: 'Give Me Money!',
        repoName: 'give-me-money',
        author: 'YunYouJun',
        logo: '#icon-cloud'
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
hr {
  opacity: 0.2;
}
</style>
