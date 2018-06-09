<template>
  <el-select class="lang-select" v-model="currentLang" placeholder="语言">
    <el-option
      v-for="item in lang"
      :key="item.code"
      :label="item.label"
      :value="item.code">
    </el-option>
  </el-select>
</template>

<script>
export default {
  data () {
    return {
      currentLang: localStorage.getItem('lang')?localStorage.getItem('lang'):'zh-CN',
      lang: [{
        code: 'zh-CN',
        label: '简体中文'
      },{
        code: 'en',
        label: 'English'
      }]
    }
  },
  watch: {
    currentLang (lang) {
      localStorage.setItem('lang', lang)
      location.reload();
      // this.$i18n.locale = lang
    }
  },
}
</script>

<style lang="scss">
.lang-select {
  width: 120px;
  input {
    border: 0px !important;
  }
}
</style>
