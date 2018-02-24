<template>
  <el-menu :default-active="activeMenuIndex" class="give-me-menu" mode="horizontal" >
    <el-menu-item index="/">
      <img width="20px" src="../../assets/money.png">
    </el-menu-item>
    <el-menu-item index="lang" class="lang">
      <el-select v-model="currentLang" placeholder="语言">
        <el-option
          v-for="item in lang"
          :key="item.code"
          :label="item.label"
          :value="item.code">
        </el-option>
      </el-select>
    </el-menu-item>

  </el-menu>
</template>

<script>
export default {
  name: 'Navbar',
  data () {
    return {
      lang: [{
        code: 'zh-CN',
        label: '简体中文'
      },{
        code: 'en',
        label: 'English'
      }],
      currentLang: localStorage.getItem('lang')?localStorage.getItem('lang'):'zh-CN'
    }
  },
  watch: {
    currentLang (lang) {
      localStorage.setItem('lang', lang)
      location.reload();
      // this.$i18n.locale = lang
    }
  },
  computed: {
    activeMenuIndex () {
      return this.$route.path
    }
  }
}
</script>

<style>
.el-menu--horizontal>.lang{
  float: right;
  border: 0px;
}

.el-select>.el-input>.el-input__inner{
  width: 120px;
  border: 0px;
}
</style>

