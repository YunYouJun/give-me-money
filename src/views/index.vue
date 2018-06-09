<template>
  <el-container>
    <el-header>
      <navbar></navbar>
    </el-header>
    
    <el-main>
      <h3>{{ this.$t('message.header') }}</h3>
      <el-row>
        <el-col :xs="{span: 24, offset: 0}" :sm="{span: 16, offset: 4}" :md="{span: 16, offset: 4}" :lg="{span: 12, offset: 6}" :xl="{span: 8, offset: 8}">
          <display-image></display-image>
        </el-col>
      </el-row>
      <h2>{{ this.$t('message.give-me-alipay') }}</h2>
      <el-row>
        <el-col :xs="{span: 24, offset: 0}" :sm="{span: 20, offset: 2}" :md="{span: 16, offset: 4}" :lg="{span: 12, offset: 6}" :xl="{span: 8, offset: 8}">
          <info-input></info-input>
        </el-col>
      </el-row>
      
      <audio autoplay="autoplay">
        <source src="../../static/audio/love.mp3" type="audio/mpeg">
      </audio>
    </el-main>

    <el-footer>
      <vue-about-me :copyright="copyright"></vue-about-me>
    </el-footer>
  </el-container>
</template>

<script>
import Navbar from '../components/common/Navbar'
import VueAboutMe from 'vue-about-me'

import DisplayImage from '../components/DisplayImage'
import InfoInput from '../components/InfoInput'
   
export default {
  name: 'can-you-give-me-money',
  components: {
    Navbar,
    DisplayImage,
    InfoInput,
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
        logo: 'far fa-credit-card'
      }
    }
  }
}
</script>

<style scoped>

</style>
