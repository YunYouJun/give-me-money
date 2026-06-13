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
  color: #2c3e50;
  border: 1px solid rgba(44, 62, 80, 0.18);
  border-radius: 8px;
  background: #fff;
}

.base-input:focus {
  border-color: #0f6f78;
  outline: 2px solid rgba(15, 111, 120, 0.14);
}

.base-input.is-invalid {
  border-color: #b23a48;
}
</style>
