<script setup lang="ts">
import VueAboutMe from 'vue-about-me'
import 'vue-about-me/style.css'

const copyright = {
  name: 'Give Me Money!',
  repo: 'give-me-money',
  author: 'YunYouJun',
}
</script>

<template>
  <hr>
  <VueAboutMe :copyright="copyright" />
</template>
