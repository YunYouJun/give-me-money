<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '~/stores/app'

const app = useAppStore()

const album = {
  wow: {
    path: '/img/0.jpg',
    label: '好吗？',
  },
  thank: {
    path: '/img/1.jpg',
    label: '那个……谢谢啦……',
  },
  hum: {
    path: '/img/2.jpg',
    label: '哼！',
  },
}

const activeImage = computed(() => {
  if (app.decision === 'ok')
    return album.thank
  if (app.decision === 'no')
    return album.hum
  return album.wow
})
</script>

<template>
  <figure class="loli-figure">
    <img
      class="loli-img"
      :src="activeImage.path"
      :alt="activeImage.label"
      width="1200"
      height="675"
      decoding="async"
      fetchpriority="high"
    >
  </figure>
</template>

<style scoped lang="scss">
.loli-figure {
  width: min(100%, 680px);
  margin: 0 auto 1.5rem;
}

.loli-img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 400px;
  object-fit: cover;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;
  border-radius: 8px;
  box-shadow: var(--gmm-shadow);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--gmm-shadow-strong);
  }
}
</style>
