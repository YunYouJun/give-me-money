<template>
  <el-menu
    :default-active="activeMenuIndex"
    class="gmm-menu"
    mode="horizontal"
    router
  >
    <el-menu-item index="/">
      <img width="20" src="/money.png" />
    </el-menu-item>
    <el-menu-item index="/brothers">
      {{ t("link.brothers") }}
    </el-menu-item>
    <el-menu-item index="/about">
      {{ t("link.about") }}
    </el-menu-item>
    <div class="right-menu">
      <lang-select class="right-menu-item"></lang-select>
    </div>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const activeMenuIndex = computed(() => {
  return route.path
})
</script>

<style lang="scss">

.right-menu {
  position: absolute;
  right: 0;
  height: 60px;
  line-height: 60px;
  &:focus {
    outline: none;
  }
  .right-menu-item {
    display: inline-flex;
    justify-content: center;
  }
}
</style>
