<script setup lang="ts">
import { VueAboutMe } from 'vue-about-me'
import { isDark } from '~/logic/dark'
import 'vue-about-me/style.css'

const copyright = {
  name: 'Give Me Money!',
  repo: 'give-me-money',
  author: 'YunYouJun',
  iconUrl: 'https://www.yunyoujun.cn/sponsors/',
}
</script>

<template>
  <hr>
  <VueAboutMe :copyright="copyright" :is-dark="isDark" />
</template>
