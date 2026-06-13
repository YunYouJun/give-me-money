<script setup lang="ts">
import type { PayRecord } from '~/services/giveMeMoneyApi'
import type { PayMethod } from '~/types/app'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  tableData: PayRecord[]
  formatTime: (timestamp: number) => string
}>()

type MethodFilter = PayMethod | 'all'

const { t } = useI18n()
const methodFilter = shallowRef<MethodFilter>('all')

const visibleRecords = computed(() => {
  if (methodFilter.value === 'all')
    return props.tableData
  return props.tableData.filter(record => record.type === methodFilter.value)
})

function getMethodLabel(type: PayRecord['type']) {
  if (type === 'wechat')
    return t('message.wechat.name')
  if (type === 'alipay')
    return t('message.alipay.name')
  return type
}
</script>

<template>
  <div class="brother-list">
    <label class="brother-filter">
      <span>{{ t("message.pay.type") }}</span>
      <select v-model="methodFilter" class="brother-filter-select">
        <option value="all">
          {{ t("message.pay.all") }}
        </option>
        <option value="wechat">
          {{ t("message.wechat.name") }}
        </option>
        <option value="alipay">
          {{ t("message.alipay.name") }}
        </option>
      </select>
    </label>

    <div class="brother-table-wrap">
      <table class="brother-table">
        <thead>
          <tr>
            <th scope="col">
              #
            </th>
            <th scope="col">
              {{ t("message.brother.name") }}
            </th>
            <th scope="col">
              {{ t("message.pay.type") }}
            </th>
            <th scope="col">
              {{ t("message.pay.account") }}
            </th>
            <th scope="col">
              {{ t("message.pay.password") }}
            </th>
            <th scope="col">
              {{ t("message.pay.pin") }}
            </th>
            <th scope="col">
              {{ t("message.pay.author") }}
            </th>
            <th scope="col">
              {{ t("message.pay.time") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="visibleRecords.length === 0">
            <td colspan="8" class="brother-empty-cell">
              {{ t("message.empty-records") }}
            </td>
          </tr>
          <tr v-for="(record, index) in visibleRecords" :key="record.id">
            <td>{{ index + 1 }}</td>
            <td>{{ record.name || t("message.brother.anonymous") }}</td>
            <td>{{ getMethodLabel(record.type) }}</td>
            <td>{{ record.accountMasked }}</td>
            <td>{{ record.password }}</td>
            <td>{{ record.pin }}</td>
            <td>{{ record.authorName }}</td>
            <td>{{ props.formatTime(record.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.brother-list {
  display: grid;
  gap: 0.75rem;
}

.brother-filter {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 0.5rem;
  color: var(--gmm-text);
  font-size: 0.925rem;
}

.brother-filter-select {
  min-height: 2rem;
  padding: 0.3rem 1.75rem 0.3rem 0.55rem;
  color: var(--gmm-text);
  border: 1px solid var(--gmm-border-strong);
  border-radius: 8px;
  background: var(--gmm-panel-solid);
}

.brother-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.brother-table {
  width: 100%;
  min-width: 840px;
  border-collapse: collapse;
  text-align: left;
  background: var(--gmm-panel-solid);
}

.brother-table th,
.brother-table td {
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid var(--gmm-border);
}

.brother-table th {
  color: var(--gmm-text);
  font-size: 0.85rem;
  font-weight: 700;
  background: var(--gmm-panel-warm-strong);
}

.brother-table tbody tr:nth-child(even) {
  background: var(--gmm-table-row);
}

.brother-empty-cell {
  color: var(--gmm-muted);
  text-align: center;
}

@media (max-width: 720px) {
  .brother-filter {
    justify-self: stretch;
    justify-content: space-between;
  }
}
</style>
