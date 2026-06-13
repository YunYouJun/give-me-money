<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <span class="base-tooltip">
    <slot />
    <span class="base-tooltip-content" role="tooltip">{{ content }}</span>
  </span>
</template>

<style scoped lang="scss">
.base-tooltip {
  position: relative;
  display: inline-flex;
}

.base-tooltip-content {
  position: absolute;
  z-index: 20;
  bottom: calc(100% + 0.45rem);
  left: 50%;
  width: max-content;
  max-width: min(16rem, 80vw);
  padding: 0.4rem 0.55rem;
  color: #2c3e50;
  font-size: 0.8125rem;
  line-height: 1.35;
  pointer-events: none;
  opacity: 0;
  border: 1px solid rgba(44, 62, 80, 0.12);
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(31, 41, 51, 0.14);
  transform: translate(-50%, 0.25rem);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.base-tooltip:hover .base-tooltip-content,
.base-tooltip:focus-within .base-tooltip-content {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
