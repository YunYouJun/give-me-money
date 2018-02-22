<template>
  <el-container>
    <el-header height="30px">
      <h3>{{ header }}</h3>
    </el-header>
    
    <el-main>
      <el-row>
        <el-col :xs="{span: 24, offset: 0}" :sm="{span: 16, offset: 4}" :md="{span: 16, offset: 4}" :lg="{span: 12, offset: 6}" :xl="{span: 8, offset: 8}">
          <display-image></display-image>
        </el-col>
      </el-row>
      <h2>{{ msg }}</h2>
      <el-row>
        <el-col :xs="{span: 22, offset: 1}" :sm="{span: 20, offset: 2}" :md="{span: 16, offset: 4}" :lg="{span: 12, offset: 6}" :xl="{span: 8, offset: 8}">
          <info-input></info-input>
        </el-col>
      </el-row>
    </el-main>

    <el-footer>
      <copyright></copyright>
    </el-footer>
  </el-container>
</template>

<script>
import DisplayImage from '../components/DisplayImage'
import InfoInput from '../components/InfoInput'
import Copyright from '../components/common/Copyright'
   
export default {
  name: 'can-you-give-me-money',
  components: {
    DisplayImage,
    InfoInput,
    Copyright
  },
  data () {
    return {
      header: '可爱的萝莉妹妹们',
      msg: '欧尼酱，可以……告诉我……你的……支付宝吗？'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
