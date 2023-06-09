<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h3 class="mb-4">
    {{ t("message.header") }}
  </h3>
  <display-image />
  <info-input />
  <audio id="love-you" autoplay>
    <source src="/audio/love.mp3" type="audio/mpeg">
  </audio>
</template>
