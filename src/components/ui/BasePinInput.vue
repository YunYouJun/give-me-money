<script setup lang="ts">
import { PinInputInput, PinInputRoot } from 'reka-ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  id?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  length?: number
  required?: boolean
}>(), {
  length: 6,
})

const model = defineModel<string>({ required: true })

const inputIndexes = computed(() =>
  Array.from({ length: props.length }, (_, index) => index),
)

const rootStyle = computed(() => ({
  '--base-pin-input-length': String(props.length),
}))

const pinValue = computed<number[]>({
  get: () => model.value
    .replace(/\D/g, '')
    .slice(0, props.length)
    .split('')
    .map(Number),
  set: (value) => {
    model.value = value
      .slice(0, props.length)
      .map(item => String(item))
      .join('')
      .replace(/\D/g, '')
      .slice(0, props.length)
  },
})
</script>

<template>
  <PinInputRoot
    :id="id"
    v-model="pinValue"
    class="base-pin-input"
    :class="{ 'is-invalid': invalid }"
    :style="rootStyle"
    type="number"
    mask
    :name="name"
    :disabled="disabled"
    :required="required"
  >
    <PinInputInput
      v-for="index in inputIndexes"
      :key="index"
      class="base-pin-input-cell"
      :index="index"
      :disabled="disabled"
      :aria-invalid="invalid ? 'true' : undefined"
    />
  </PinInputRoot>
</template>

<style scoped lang="scss">
.base-pin-input {
  display: grid;
  grid-template-columns: repeat(var(--base-pin-input-length), minmax(0, 1fr));
  gap: clamp(0.25rem, 1.6vw, 0.55rem);
  width: min(100%, 21rem);
}

.base-pin-input-cell {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0;
  color: var(--gmm-text);
  font-size: 1.1rem;
  line-height: 1;
  text-align: center;
  border: 1px solid var(--gmm-border-strong);
  border-radius: 8px;
  background: var(--gmm-panel-solid);
  appearance: none;
}

.base-pin-input-cell:focus {
  border-color: var(--gmm-primary);
  outline: 2px solid var(--gmm-primary-focus);
}

.base-pin-input.is-invalid .base-pin-input-cell {
  border-color: var(--gmm-danger);
}

.base-pin-input-cell:disabled {
  color: var(--gmm-muted);
  background: var(--gmm-input-disabled-bg);
  cursor: not-allowed;
}

@media (max-width: 360px) {
  .base-pin-input {
    gap: 0.2rem;
  }
}
</style>
