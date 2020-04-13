<template>
  <div>
    <el-menu
      :default-active="activeMenuIndex"
      class="gmm-menu"
      mode="horizontal"
      router
    >
      <el-menu-item index="/">
        <img width="20px" src="../../assets/money.png" />
      </el-menu-item>
      <el-menu-item index="/brothers">
        {{ $t("link.brothers") }}
      </el-menu-item>
      <el-menu-item index="/about">
        {{ $t("link.about") }}
      </el-menu-item>
      <div class="right-menu">
        <lang-select class="right-menu-item"></lang-select>
      </div>
    </el-menu>
  </div>
</template>

<script>
import LangSelect from "./LangSelect";

export default {
  name: "Navbar",
  components: {
    LangSelect
  },
  data() {
    return {};
  },
  computed: {
    activeMenuIndex() {
      return this.$route.path;
    }
  }
};
</script>

<style lang="scss" scoped>
.right-menu {
  float: right;
  height: 100%;
  line-height: 60px;
  &:focus {
    outline: none;
  }
  .right-menu-item {
    display: inline-block;
    margin: 0 8px;
  }
}
</style>
