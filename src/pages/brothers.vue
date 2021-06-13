<template>
  <h2>{{ total + t("title.good-brothers") }}</h2>
  <div ref="listRef">
    <brother-list :tableData="tableData"></brother-list>
  </div>
  <el-pagination
    background
    layout="prev, pager, next"
    :total="total"
    :page-size="pageSize"
    style="margin-top: 1rem"
    @current-change="handleCurrentChange"
  >
  </el-pagination>
</template>

<script setup lang="ts">
import { ElMessage, ElLoading } from "element-plus";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import AV from "leancloud-storage";
import dayjs from "dayjs";
import type { PayMethod } from "~/types/app";

const { t } = useI18n();

const listRef = ref();

const total = ref(0);
const pageSize = 20;

interface PayItem {
  account: string;
  createdAt: string;
  name: string;
  password: string;
  pin: string;
  type: PayMethod;
}

const tableData = ref<PayItem[]>([
  {
    account: "me@yunyoujun.cn",
    createdAt: "2021-05-20 13:34:00",
    name: "云游君",
    password: "YunYouJun",
    pin: "520520",
    type: "alipay",
  },
]);

/**
 * 分页切换
 */
function handleCurrentChange(page: number) {
  const tableLoading = ElLoading.service({ target: listRef.value });

  const queryAccount = new AV.Query("Pay");
  queryAccount.descending("createdAt");
  queryAccount.limit(pageSize);
  queryAccount.skip(pageSize * (page - 1));
  queryAccount.find().then(
    (accounts) => {
      tableData.value = handleData(accounts);
      tableLoading.close();
    },
    (error) => {
      ElMessage({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    }
  );
}

/**
 * 格式化数据
 */
function handleData(accounts: AV.Queriable[]) {
  const data: any[] = [];
  accounts.forEach((account) => {
    const attributes = (account as any).attributes;
    attributes.account =
      attributes.account[0] +
      "******" +
      attributes.account[attributes.account.length - 1];
    attributes.createdAt = dayjs(account.createdAt).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    data.push(attributes);
  });
  return data;
}

/**
 * 获取所有账户信息
 */
function getAccountsInfo() {
  const tableLoading = ElLoading.service({ target: listRef.value });

  const queryAccount = new AV.Query("Pay");
  queryAccount.descending("createdAt");
  queryAccount.count().then(
    (count) => {
      total.value = count;
    },
    (error) => {
      ElMessage({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    }
  );
  queryAccount.limit(pageSize);
  queryAccount.find().then(
    (accounts) => {
      tableData.value = handleData(accounts);
      tableLoading.close();
    },
    (error) => {
      ElMessage({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    }
  );
}

onMounted(() => {
  getAccountsInfo();
});
</script>
