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
    <span v-if="loading" class="base-button-spinner" aria-hidden="true" />
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
  color: #2c3e50;
  cursor: pointer;
  border: 1px solid rgba(44, 62, 80, 0.16);
  border-radius: 8px;
  background: #fff;
}

.base-button--small {
  min-height: 2rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.875rem;
}

.base-button--primary {
  color: #0f6f78;
  border-color: rgba(15, 111, 120, 0.35);
}

.base-button--danger {
  color: #b23a48;
  border-color: rgba(178, 58, 72, 0.35);
}

.base-button--success {
  color: #1f7a4d;
  border-color: rgba(31, 122, 77, 0.35);
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.base-button-spinner {
  width: 0.85rem;
  height: 0.85rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: base-button-spin 0.8s linear infinite;
}

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
