<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { TooltipProvider } from 'reka-ui'

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Give me money! | 我很可爱，请给我钱！',
  meta: [{ name: 'description', content: '我很可爱，请给我钱！' }],
})
</script>

<template>
  <TooltipProvider
    :delay-duration="250"
    :skip-delay-duration="100"
  >
    <router-view />
    <BaseToastHost />
  </TooltipProvider>
</template>
