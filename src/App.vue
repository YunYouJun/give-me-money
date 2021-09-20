<template>
  <el-config-provider :locale="app.locale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import { useHead } from '@vueuse/head'
import { useAppStore } from './stores/app'

const app = useAppStore()

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Give me money! | 我很可爱，请给我钱！',
  meta: [{ name: 'description', content: '我很可爱，请给我钱！' }],
})
</script>
