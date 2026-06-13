<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import DisplayImage from '~/components/DisplayImage.vue'
import InfoInput from '~/components/InfoInput.vue'
import NsfwPreviewWarning from '~/components/NsfwPreviewWarning.vue'
import { isClient } from '~/utils/isClient'

const { t } = useI18n()
const PREVIEW_WARNING_KEY = 'give-me-money:preview-warning-accepted'

const isPreviewAllowed = shallowRef(false)

function hasPreviewConsent() {
  if (!isClient)
    return false

  try {
    return sessionStorage.getItem(PREVIEW_WARNING_KEY) === 'true'
  }
  catch {
    return false
  }
}

function rememberPreviewConsent() {
  if (!isClient)
    return

  try {
    sessionStorage.setItem(PREVIEW_WARNING_KEY, 'true')
  }
  catch {}
}

function allowPreview() {
  isPreviewAllowed.value = true
  rememberPreviewConsent()
}

onMounted(() => {
  isPreviewAllowed.value = hasPreviewConsent()
})
</script>

<template>
  <NsfwPreviewWarning
    v-if="!isPreviewAllowed"
    @continue="allowPreview"
  />
  <template v-else>
    <h3 class="mb-4">
      {{ t("message.header") }}
    </h3>
    <DisplayImage />
    <InfoInput />
    <audio id="love-you" preload="none" aria-hidden="true">
      <source src="/audio/love.mp3" type="audio/mpeg">
    </audio>
  </template>
</template>
