<template>
  <h2>{{ total + t("title.good-brothers") }}</h2>
  <el-table
    v-loading="loading"
    :default-sort="{ prop: 'createdAt', order: 'descending' }"
    :data="tableData"
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
    <!-- has router toogle problem -->
    <!-- for example /brothers & /about toggle -->
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
  <el-pagination
    background
    layout="prev, pager, next"
    :total="total"
    :page-size="pageSize"
    style="margin-top: 1rem;"
    @current-change="handleCurrentChange"
  >
  </el-pagination>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import AV from "leancloud-storage";
import { ElMessage } from "element-plus";

const { t } = useI18n();

const pageSize = 20;
const tableData = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);

/**
 * 过滤支付方式
 */
function filterPayMethod(value: string, row: any) {
  return row.type === value;
}

function getAccountsInfo() {
  const queryAccount = new AV.Query("Pay");
  queryAccount.descending("createdAt");
  queryAccount.count().then(
    count => {
      total.value = count;
    },
    error => {
      ElMessage({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    },
  );
  queryAccount.limit(pageSize);
  queryAccount.find().then(
    accounts => {
      handleData(accounts);
      loading.value = false;
    },
    error => {
      ElMessage({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    },
  );
}

/**
 * 分页切换
 */
function handleCurrentChange(page: number) {
  loading.value = true;
  const queryAccount = new AV.Query("Pay");
  queryAccount.descending("createdAt");
  queryAccount.limit(pageSize);
  queryAccount.skip(pageSize * (page - 1));
  queryAccount.find().then(
    accounts => {
      tableData.value = [];
      handleData(accounts);
      loading.value = false;
    },
    error => {
      ElMessage({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    },
  );
}

/**
 * 格式化数据
 */
function handleData(accounts: AV.Queriable[]) {
  accounts.forEach(account => {
    const attributes = (account as any).attributes;
    attributes.account =
      attributes.account[0] +
      "******" +
      attributes.account[attributes.account.length - 1];
    attributes.createdAt = dayjs(account.createdAt).format(
      "YYYY-MM-DD HH:mm:ss",
    );
    tableData.value.push(attributes);
  });
}

onMounted(() => {
  getAccountsInfo();
});
</script>
