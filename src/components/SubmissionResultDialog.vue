<script setup lang="ts">
defineProps<{
  commentsUrl: string
  message: string
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="submission-dialog-backdrop" role="presentation">
    <section
      class="submission-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-dialog-title"
    >
      <h3 id="submission-dialog-title" class="submission-dialog-title">
        {{ title }}
      </h3>
      <p class="submission-dialog-message">
        {{ message }}
      </p>
      <div class="submission-dialog-actions">
        <a
          class="submission-dialog-action is-primary"
          :href="commentsUrl"
          target="_blank"
          rel="noopener"
        >
          {{ $t("message.open-comments") }}
        </a>
        <button
          class="submission-dialog-action"
          type="button"
          @click="emit('close')"
        >
          {{ $t("button.close") }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.submission-dialog-backdrop {
  position: fixed;
  z-index: 2500;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(16, 24, 23, 0.38);
}

.submission-dialog {
  width: min(100%, 28rem);
  padding: 1.25rem;
  color: var(--gmm-text);
  text-align: left;
  border: 1px solid var(--gmm-border-strong);
  border-radius: 8px;
  background: var(--gmm-panel-solid);
  box-shadow: var(--gmm-shadow-strong);
}

.submission-dialog-title {
  margin: 0;
  color: var(--gmm-heading);
  font-size: 1.2rem;
  line-height: 1.35;
}

.submission-dialog-message {
  margin: 0.75rem 0 0;
  line-height: 1.65;
}

.submission-dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.submission-dialog-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  padding: 0.45rem 0.875rem;
  color: var(--gmm-text);
  cursor: pointer;
  text-decoration: none;
  border: 1px solid var(--gmm-border-strong);
  border-radius: 8px;
  background: var(--gmm-panel-solid);

  &.is-primary {
    color: var(--gmm-primary);
    border-color: var(--gmm-primary-border);
  }
}

@media (max-width: 480px) {
  .submission-dialog-actions {
    display: grid;
  }
}
</style>
