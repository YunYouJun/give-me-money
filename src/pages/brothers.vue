<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCommentsUrl } from '~/services/commentsConfig'
import { redirectToExternalUrl } from '~/utils/externalNavigation'

const { t } = useI18n()
const commentsUrl = getCommentsUrl()

useHead({
  title: 'Comments | Give me money!',
  meta: [
    {
      'http-equiv': 'refresh',
      'content': `0;url=${commentsUrl}`,
    },
  ],
})

onMounted(() => {
  redirectToExternalUrl(commentsUrl)
})
</script>

<template>
  <section class="brothers-redirect">
    <p>{{ t("message.redirecting-comments") }}</p>
    <a
      class="brothers-redirect-link"
      :href="commentsUrl"
      rel="noopener"
    >
      {{ t("message.open-comments") }}
    </a>
  </section>
</template>

<style scoped lang="scss">
.brothers-redirect {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  width: min(100%, 36rem);
  margin: 3rem auto;
}

.brothers-redirect-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  padding: 0.45rem 0.875rem;
  color: var(--gmm-primary);
  text-decoration: none;
  border: 1px solid var(--gmm-primary-border);
  border-radius: 8px;
  background: var(--gmm-panel-solid);
}
</style>
