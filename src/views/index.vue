<template>
  <div>
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
  </div>
</template>

<script>
import DisplayImage from '../components/DisplayImage'
import InfoInput from '../components/InfoInput'
   
export default {
  name: 'can-you-give-me-money',
  components: {
    DisplayImage,
    InfoInput,
  },
}
</script>

<style scoped>

</style>
