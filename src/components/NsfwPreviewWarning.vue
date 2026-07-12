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
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.55rem 1rem;
  width: min(100%, 38rem);
  padding: clamp(1.25rem, 4vw, 2rem);
  margin: clamp(2rem, 10vh, 6rem) auto 2rem;
  color: var(--gmm-text);
  text-align: left;
  border: 1px solid var(--gmm-border);
  border-radius: 1.25rem;
  background: var(--gmm-panel-solid);
  box-shadow: var(--gmm-shadow-strong);
}

.nsfw-warning-icon {
  grid-row: 1 / span 2;
  padding: 0.65rem;
  color: #624600;
  font-size: 1.65rem;
  border-radius: 50%;
  background: var(--gmm-accent);
}

.nsfw-warning-title {
  margin: 0;
  color: var(--gmm-heading);
  font-family: ui-rounded, 'Arial Rounded MT Bold', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1.2;
}

.nsfw-warning-description {
  margin: 0;
  color: var(--gmm-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.nsfw-warning :deep(.base-button) {
  grid-column: 2;
  justify-self: start;
  min-height: 2.75rem;
  padding-inline: 1.1rem;
  color: #fff;
  border-color: var(--gmm-primary);
  background: var(--gmm-primary);
}

@media (max-width: 640px) {
  .nsfw-warning {
    grid-template-columns: 1fr;
    justify-items: start;
    margin-top: 2.5rem;
  }

  .nsfw-warning-icon {
    grid-row: auto;
  }

  .nsfw-warning :deep(.base-button) {
    grid-column: 1;
  }
}
</style>
