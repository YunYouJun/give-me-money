<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'danger' | 'success' | 'neutral'
  size?: 'default' | 'small'
  disabled?: boolean
  loading?: boolean
}>(), {
  size: 'default',
  type: 'button',
  variant: 'neutral',
})

const emit = defineEmits<{
  click: [MouseEvent]
}>()

function onClick(event: MouseEvent) {
  if (props.disabled || props.loading)
    return
  emit('click', event)
}
</script>

<template>
  <button
    class="base-button"
    :class="[`base-button--${variant}`, `base-button--${size}`]"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="base-button-spinner i-svg-spinners-180-ring-with-bg"
      aria-hidden="true"
    />
    <slot name="icon" />
    <span class="base-button-label"><slot /></span>
  </button>
</template>

<style scoped lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.25rem;
  padding: 0.45rem 0.875rem;
  color: var(--gmm-text);
  cursor: pointer;
  border: 1px solid var(--gmm-border-strong);
  border-radius: 8px;
  background: var(--gmm-panel-solid);
}

.base-button--small {
  min-height: 2rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.875rem;
}

.base-button--primary {
  color: var(--gmm-primary);
  border-color: var(--gmm-primary-border);
}

.base-button--danger {
  color: var(--gmm-danger);
  border-color: var(--gmm-danger-border);
}

.base-button--success {
  color: var(--gmm-success);
  border-color: var(--gmm-success-border);
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.base-button-spinner {
  width: 0.85rem;
  height: 0.85rem;
  color: currentColor;
}
</style>
