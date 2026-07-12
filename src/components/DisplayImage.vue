<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '~/stores/app'

const app = useAppStore()

const album = {
  wow: {
    height: 1080,
    path: '/img/0.jpg',
    label: '好吗？',
    width: 1920,
  },
  thank: {
    height: 759,
    path: '/img/1.jpg',
    label: '那个……谢谢啦……',
    width: 1200,
  },
  hum: {
    height: 1080,
    path: '/img/2.jpg',
    label: '哼！',
    width: 1920,
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
    <div class="loli-frame">
      <img
        class="loli-img"
        :src="activeImage.path"
        :alt="activeImage.label"
        :width="activeImage.width"
        :height="activeImage.height"
        decoding="async"
        fetchpriority="high"
      >
      <span class="loli-sticker" aria-hidden="true">¥?</span>
    </div>
    <figcaption class="loli-caption">
      <span class="loli-caption-dot" aria-hidden="true" />
      {{ activeImage.label }}
    </figcaption>
  </figure>
</template>

<style scoped lang="scss">
.loli-figure {
  width: 100%;
  margin: 0;
}

.loli-frame {
  position: relative;
  padding: 0.55rem;
  border: 1px solid var(--gmm-border);
  border-radius: 1.25rem;
  background: var(--gmm-panel-solid);
  box-shadow: var(--gmm-shadow);
}

.loli-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center;
  transition:
    filter 0.25s ease,
    transform 0.25s ease;
  border-radius: 0.85rem;

  .loli-frame:hover & {
    filter: saturate(1.06);
    transform: scale(1.008);
  }
}

.loli-sticker {
  position: absolute;
  right: -0.55rem;
  bottom: 1.25rem;
  display: grid;
  width: 3.5rem;
  aspect-ratio: 1;
  place-items: center;
  color: #624600;
  font-family: ui-rounded, 'Arial Rounded MT Bold', sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
  border: 2px solid var(--gmm-panel-solid);
  border-radius: 50%;
  background: var(--gmm-accent);
  box-shadow: 0 6px 16px rgba(45, 55, 60, 0.18);
  transform: rotate(9deg);
}

.loli-caption {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  color: var(--gmm-muted);
  font-size: 0.85rem;
  text-align: left;
}

.loli-caption-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--gmm-danger);
  box-shadow: 0 0 0 4px var(--gmm-danger-soft);
}

@media (min-width: 861px) {
  .loli-frame {
    position: sticky;
    top: 5.5rem;
  }
}
</style>
