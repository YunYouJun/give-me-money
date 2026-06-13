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
  text-align: left;
  pointer-events: auto;
  border: 1px solid rgba(31, 41, 51, 0.12);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(31, 41, 51, 0.14);
}

.toast--success {
  border-color: rgba(31, 146, 91, 0.3);
}

.toast--warning {
  border-color: rgba(196, 137, 36, 0.34);
}

.toast--error {
  border-color: rgba(196, 70, 70, 0.34);
}

.toast--info {
  border-color: rgba(71, 118, 171, 0.3);
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
