<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { dismissToast, toasts } = useToast()
</script>

<template>
  <div class="toast-host" aria-live="polite" aria-relevant="additions removals">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      role="status"
      class="toast"
      :class="`toast--${toast.type}`"
    >
      <span class="toast-message">{{ toast.message }}</span>
      <button
        class="toast-close"
        type="button"
        aria-label="Close message"
        @click="dismissToast(toast.id)"
      >
        x
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toast-host {
  position: fixed;
  z-index: 3000;
  top: 1rem;
  right: 1rem;
  display: grid;
  width: min(24rem, calc(100vw - 2rem));
  gap: 0.75rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  color: var(--gmm-text);
  text-align: left;
  pointer-events: auto;
  border: 1px solid var(--gmm-border);
  border-radius: 8px;
  background: var(--gmm-panel-solid);
  box-shadow: var(--gmm-shadow-strong);
}

.toast--success {
  border-color: var(--gmm-success-border);
}

.toast--warning {
  border-color: var(--gmm-warning-border);
}

.toast--error {
  border-color: var(--gmm-danger-border);
}

.toast--info {
  border-color: var(--gmm-info-border);
}

.toast-message {
  line-height: 1.45;
}

.toast-close {
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 50%;
}
</style>
