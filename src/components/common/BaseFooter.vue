<template>
  <hr />
  <vue-about-me :copyright="copyright"></vue-about-me>
</template>

<script setup lang="ts">
import VueAboutMe from 'vue-about-me'
import 'vue-about-me/styles.css'

const copyright = {
  name: 'Give Me Money!',
  repo: 'give-me-money',
  author: 'YunYouJun',
  logo: 'ri:cloud-line',
  link: 'https://sponsors.yunyoujun.cn',
}
</script>
