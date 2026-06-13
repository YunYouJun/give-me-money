<script setup lang="ts">
import type { PayRecord } from '~/services/giveMeMoneyApi'
import dayjs from 'dayjs'
import { onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/services/apiError'

const { t } = useI18n()

const total = shallowRef(0)
const currentPage = shallowRef(1)
const pageSize = 20
const loading = shallowRef(false)
const errorMessage = shallowRef('')
const tableData = shallowRef<PayRecord[]>([])
let requestId = 0

function formatRecord(record: PayRecord): PayRecord {
  return {
    ...record,
    createdAt: record.createdAt,
  }
}

async function loadPage(page = currentPage.value) {
  const currentRequestId = requestId + 1
  requestId = currentRequestId

  try {
    loading.value = true
    errorMessage.value = ''
    currentPage.value = page
    const { listPayRecords } = await import('~/services/giveMeMoneyApi')
    const result = await listPayRecords(page, pageSize)
    if (currentRequestId !== requestId)
      return
    tableData.value = result.items.map(formatRecord)
    total.value = result.total
  }
  catch (error) {
    if (currentRequestId !== requestId)
      return
    errorMessage.value = getApiErrorMessage(error)
    tableData.value = []
    total.value = 0
    showToast({
      message: errorMessage.value,
      type: 'warning',
    })
  }
  finally {
    if (currentRequestId === requestId)
      loading.value = false
  }
}

function handleCurrentChange(page: number) {
  loadPage(page)
}

function formatTime(timestamp: number) {
  return timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') : '-'
}

onMounted(() => {
  loadPage()
})
</script>

<template>
  <section class="brothers-page">
    <header class="brothers-header">
      <h2>{{ total + t("title.good-brothers") }}</h2>
      <BaseButton
        size="small"
        :loading="loading"
        @click="loadPage()"
      >
        <template #icon>
          <i-ri-refresh-line />
        </template>
        {{ t("message.refresh") }}
      </BaseButton>
    </header>

    <div v-if="loading" class="brothers-state">
      {{ t("message.loading") }}
    </div>
    <div v-else-if="errorMessage" class="brothers-state is-error">
      {{ errorMessage }}
    </div>
    <div v-else-if="!loading && tableData.length === 0" class="brothers-state">
      {{ t("message.empty-records") }}
    </div>

    <brother-list
      :table-data="tableData"
      :format-time="formatTime"
    />

    <BrotherPagination
      v-if="total > pageSize"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @change="handleCurrentChange"
    />
  </section>
</template>

<style scoped lang="scss">
.brothers-page {
  width: min(100%, 1080px);
  margin: 0 auto;
}

.brothers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
  }
}

.brothers-state {
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  text-align: left;
  border: 1px dashed var(--gmm-border-strong);
  border-radius: 8px;
  background: var(--gmm-panel-warm);

  &.is-error {
    color: var(--gmm-danger-strong);
    border-color: var(--gmm-danger-border);
    background: var(--gmm-panel-danger);
  }
}

@media (max-width: 720px) {
  .brothers-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
