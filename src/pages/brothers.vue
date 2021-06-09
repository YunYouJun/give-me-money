<template>
  <div>
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
      <el-table-column
        prop="type"
        :label="t('message.pay.type')"
        width="100"
        :filters="[
          { text: '微信', value: 'wechat' },
          { text: '支付宝', value: 'alipay' },
        ]"
        :filter-method="filterTag"
      >
        <template #default="scope">
          <el-tag :type="scope.row.type === 'alipay' ? 'primary' : 'success'">
            {{ t("message." + scope.row.type + ".name") }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="account" :label="t('message.pay.account')">
      </el-table-column>
      <el-table-column prop="password" :label="t('message.pay.password')">
      </el-table-column>
      <el-table-column prop="pin" :label="t('message.pay.pin')" width="100">
      </el-table-column>
      <el-table-column
        prop="createdAt"
        :label="t('message.pay.time')"
        sortable
      >
        <template #default="scope">
          <i class="el-icon-time"></i>
          &nbsp;
          <span>{{ scope.row.createdAt }}</span>
        </template>
      </el-table-column>
    </el-table>
    <hr />
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

export default defineComponent({
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      tableData: [],
      total: 0,
      pageSize: 20,
      loading: true,
    };
  },
  mounted() {
    this.getAccountsInfo();
  },
  methods: {
    handleData(accounts) {
      accounts.forEach(account => {
        account.attributes.account =
          account.attributes.account[0] +
          "******" +
          account.attributes.account[account.attributes.account.length - 1];
        account.attributes.createdAt = dayjs(account.createdAt).format(
          "YYYY-MM-DD HH:mm:ss",
        );
        this.tableData.push(account.attributes);
      });
    },
    handleCurrentChange(val) {
      this.loading = true;
      const queryAccount = new this.$AV.Query("Pay");
      queryAccount.descending("createdAt");
      queryAccount.limit(this.pageSize);
      queryAccount.skip(this.pageSize * (val - 1));
      queryAccount.find().then(
        accounts => {
          this.tableData = [];
          this.handleData(accounts);
          this.loading = false;
        },
        error => {
          this.$message({
            showClose: true,
            message: "Code " + error.code + " : " + error.rawMessage,
            type: "warning",
          });
        },
      );
    },
    filterTag(value, row) {
      return row.type === value;
    },
    getAccountsInfo() {
      const queryAccount = new this.$AV.Query("Pay");
      queryAccount.descending("createdAt");
      queryAccount.count().then(
        count => {
          this.total = count;
        },
        error => {
          this.$message({
            showClose: true,
            message: "Code " + error.code + " : " + error.rawMessage,
            type: "warning",
          });
        },
      );
      queryAccount.limit(this.pageSize);
      queryAccount.find().then(
        accounts => {
          this.handleData(accounts);
          this.loading = false;
        },
        error => {
          this.$message({
            showClose: true,
            message: "Code " + error.code + " : " + error.rawMessage,
            type: "warning",
          });
        },
      );
    },
  },
});
</script>
