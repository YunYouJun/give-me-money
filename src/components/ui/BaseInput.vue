<script setup lang="ts">
withDefaults(defineProps<{
  id?: string
  type?: 'text' | 'password'
  placeholder?: string
  disabled?: boolean
  maxlength?: number
  inputmode?: 'text' | 'numeric'
  invalid?: boolean
}>(), {
  inputmode: 'text',
  type: 'text',
})

const model = defineModel<string>({ required: true })
</script>

<template>
  <input
    :id="id"
    v-model="model"
    class="base-input"
    :class="{ 'is-invalid': invalid }"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :inputmode="inputmode"
    :aria-invalid="invalid ? 'true' : undefined"
  >
</template>

<style scoped lang="scss">
.base-input {
  box-sizing: border-box;
  width: 100%;
  min-height: 2.35rem;
  padding: 0.45rem 0.65rem;
  color: var(--gmm-text);
  border: 1px solid var(--gmm-border-strong);
  border-radius: 8px;
  background: var(--gmm-panel-solid);
}

.base-input:focus {
  border-color: var(--gmm-primary);
  outline: 2px solid var(--gmm-primary-focus);
}

.base-input.is-invalid {
  border-color: var(--gmm-danger);
}
</style>
