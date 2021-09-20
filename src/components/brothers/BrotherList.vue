<template>
  <el-table
    :default-sort="{ prop: 'createdAt', order: 'descending' }"
    :data="props.tableData"
    stripe
    align="left"
    style="width: 100%"
  >
    <el-table-column fixed type="index">
    </el-table-column>
    <el-table-column fixed prop="name" :label="t('message.brother.name')">
      <template #default="scope">
        {{ scope.row.name || t("message.brother.anonymous") }}
      </template>
    </el-table-column>
    <el-table-column
      prop="type"
      :label="t('message.pay.type')"
      width="100"
      :filters="[
        { text: '微信支付', value: 'wechat' },
        { text: '支付宝', value: 'alipay' },
      ]"
      :filter-method="filterPayMethod"
    >
      <template #default="scope">
        <i-ri-wechat-pay-line
          v-if="scope.row.type === 'wechat'"
          color="#2DC100"
        ></i-ri-wechat-pay-line>
        <i-ri-alipay-line
          v-else-if="scope.row.type === 'alipay'"
          color="#00A3EE"
        ></i-ri-alipay-line>
        <span v-else>{{ scope.row.type }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="account" :label="t('message.pay.account')">
    </el-table-column>
    <el-table-column prop="password" :label="t('message.pay.password')">
    </el-table-column>
    <el-table-column prop="pin" :label="t('message.pay.pin')" width="100">
    </el-table-column>
    <el-table-column prop="createdAt" :label="t('message.pay.time')" sortable>
      <template #default="scope">
        <i class="el-icon-time"></i>
        &nbsp;
        <span>{{ scope.row.createdAt }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PayMethod } from '~/types/app'

interface BrotherItem {
  account: string
  createdAt: string
  name: string
  password: string
  pin: string
  type: PayMethod
}

const props = withDefaults(defineProps<{tableData: BrotherItem[]}>(), {
  tableData: () => {
    return [
      {
        account: 'c******m',
        createdAt: '2021-06-11 10:38:15',
        name: '321',
        password: '32131321312213',
        pin: '332132',
        type: 'alipay',
      },
    ]
  },
})
const { t } = useI18n()

/**
 * 过滤支付方式
 */
function filterPayMethod(value: string, row: any) {
  return row.type === value
}
</script>
