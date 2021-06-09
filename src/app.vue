<template>
  <router-view />
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: "Give me money! | 我很可爱，请给我钱！",
  meta: [{ name: "description", content: "我很可爱，请给我钱！" }],
});
</script>
