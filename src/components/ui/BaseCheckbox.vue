<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()

const model = defineModel<boolean>({ required: true })
</script>

<template>
  <label class="base-checkbox">
    <input
      v-model="model"
      class="base-checkbox-input"
      type="checkbox"
      :disabled="disabled"
    >
    <span class="base-checkbox-box" aria-hidden="true" />
    <span class="base-checkbox-label"><slot /></span>
  </label>
</template>

<style scoped lang="scss">
.base-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.55rem;
  text-align: left;
  cursor: pointer;
}

.base-checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.base-checkbox-box {
  display: inline-flex;
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  margin-top: 0.18rem;
  border: 1px solid var(--gmm-border-strong);
  border-radius: 4px;
  background: var(--gmm-panel-solid);
}

.base-checkbox-input:checked + .base-checkbox-box {
  border-color: var(--gmm-primary);
  background: var(--gmm-primary);
  box-shadow: inset 0 0 0 3px var(--gmm-panel-solid);
}

.base-checkbox-input:focus-visible + .base-checkbox-box {
  outline: 2px solid var(--gmm-primary-focus);
  outline-offset: 2px;
}

.base-checkbox-input:disabled ~ .base-checkbox-label {
  cursor: not-allowed;
  opacity: 0.62;
}
</style>
