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
  color: #2c3e50;
  border: 1px solid rgba(178, 58, 72, 0.24);
  border-radius: 8px;
  background: #fff7f7;
  box-shadow: 0 10px 28px rgba(44, 62, 80, 0.08);
}

.nsfw-warning-icon {
  color: #b23a48;
  font-size: 3rem;
}

.nsfw-warning-title {
  margin: 0;
  color: #1f2933;
  font-size: 1.75rem;
  line-height: 1.2;
}

.nsfw-warning-description {
  max-width: 32rem;
  margin: 0;
  color: #52616b;
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
