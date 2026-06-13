<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <nav class="brother-pagination" aria-label="Brothers pagination">
    <BaseButton
      size="small"
      :disabled="currentPage <= 1"
      @click="emit('change', currentPage - 1)"
    >
      Prev
    </BaseButton>
    <span class="brother-pagination-current">{{ currentPage }} / {{ pageCount }}</span>
    <BaseButton
      size="small"
      :disabled="currentPage >= pageCount"
      @click="emit('change', currentPage + 1)"
    >
      Next
    </BaseButton>
  </nav>
</template>

<style scoped lang="scss">
.brother-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.brother-pagination-current {
  min-width: 4rem;
  text-align: center;
}
</style>
