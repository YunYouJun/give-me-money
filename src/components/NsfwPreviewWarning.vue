<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  continue: []
}>()

const { t } = useI18n()
</script>

<template>
  <section
    class="nsfw-warning"
    role="region"
    aria-labelledby="nsfw-warning-title"
    aria-describedby="nsfw-warning-description"
  >
    <i-ri-error-warning-line class="nsfw-warning-icon" aria-hidden="true" />
    <h1 id="nsfw-warning-title" class="nsfw-warning-title">
      {{ t("message.nsfw.title") }}
    </h1>
    <p id="nsfw-warning-description" class="nsfw-warning-description">
      {{ t("message.nsfw.description") }}
    </p>
    <BaseButton variant="primary" @click="emit('continue')">
      <template #icon>
        <i-ri-eye-line />
      </template>
      {{ t("message.nsfw.continue") }}
    </BaseButton>
  </section>
</template>

<style scoped lang="scss">
.nsfw-warning {
  display: grid;
  justify-items: center;
  gap: 1rem;
  width: min(100%, 680px);
  padding: 2rem;
  margin: 4rem auto 2rem;
  color: var(--gmm-text);
  border: 1px solid var(--gmm-danger-border);
  border-radius: 8px;
  background: var(--gmm-panel-danger);
  box-shadow: var(--gmm-shadow);
}

.nsfw-warning-icon {
  color: var(--gmm-danger);
  font-size: 3rem;
}

.nsfw-warning-title {
  margin: 0;
  color: var(--gmm-heading);
  font-size: 1.75rem;
  line-height: 1.2;
}

.nsfw-warning-description {
  max-width: 32rem;
  margin: 0;
  color: var(--gmm-muted);
  font-size: 1rem;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .nsfw-warning {
    padding: 1.5rem;
    margin-top: 2rem;
  }
}
</style>
