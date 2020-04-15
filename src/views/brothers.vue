<template>
  <div>
    <h2>{{ total + $t("title.good-brothers") }}</h2>
    <el-table
      v-loading="loading"
      :default-sort="{ prop: 'createdAt', order: 'descending' }"
      :data="tableData"
      stripe
      align="left"
      style="width: 100%"
    >
      <el-table-column fixed type="index"> </el-table-column>
      <el-table-column fixed prop="name" :label="$t('message.brother.name')">
        <template slot-scope="scope">
          {{ scope.row.name || $t("message.brother.anonymous") }}
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        :label="$t('message.pay.type')"
        width="100"
        :filters="[
          { text: '微信', value: 'wechat' },
          { text: '支付宝', value: 'alipay' },
        ]"
        :filter-method="filterTag"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.type === 'alipay' ? 'primary' : 'success'">
            {{ $t("message." + scope.row.type + ".name") }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="account" :label="$t('message.pay.account')">
      </el-table-column>
      <el-table-column prop="password" :label="$t('message.pay.password')">
      </el-table-column>
      <el-table-column prop="pin" :label="$t('message.pay.pin')" width="100">
      </el-table-column>
      <el-table-column
        prop="createdAt"
        :label="$t('message.pay.time')"
        sortable
      >
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          &nbsp;
          <span>{{ scope.row.createdAt }}</span>
        </template>
      </el-table-column>
    </el-table>
    <hr />
    <el-pagination
      @current-change="handleCurrentChange"
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [],
      total: 0,
      pageSize: 20,
      loading: true,
    };
  },
  mounted() {
    Date.prototype.Format = function(fmt) {
      //author: meizz
      let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        S: this.getMilliseconds(), //毫秒
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (this.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length === 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
      return fmt;
    };
    this.getAccountsInfo();
  },
  methods: {
    handleCurrentChange(val) {
      this.loading = true;
      let queryAccount = new this.$AV.Query("Pay");
      queryAccount.descending("createdAt");
      queryAccount.limit(this.pageSize);
      queryAccount.skip(this.pageSize * (val - 1));
      queryAccount.find().then(
        (accounts) => {
          this.tableData = [];
          for (let i = 0; i < accounts.length; i++) {
            accounts[i].attributes.createdAt = new Date(
              accounts[i].createdAt
            ).Format("yyyy-MM-dd HH:mm:ss");
            this.tableData.push(accounts[i].attributes);
          }
          this.loading = false;
        },
        (error) => {
          this.$message({
            showClose: true,
            message: "Code " + error.code + " : " + error.rawMessage,
            type: "warning",
          });
        }
      );
    },
    filterTag(value, row) {
      return row.type === value;
    },
    getAccountsInfo() {
      let queryAccount = new this.$AV.Query("Pay");
      queryAccount.descending("createdAt");
      queryAccount.count().then(
        (count) => {
          this.total = count;
        },
        (error) => {
          this.$message({
            showClose: true,
            message: "Code " + error.code + " : " + error.rawMessage,
            type: "warning",
          });
        }
      );
      queryAccount.limit(this.pageSize);
      queryAccount.find().then(
        (accounts) => {
          for (let i = 0; i < accounts.length; i++) {
            accounts[i].attributes.createdAt = new Date(
              accounts[i].createdAt
            ).Format("yyyy-MM-dd HH:mm:ss");
            this.tableData.push(accounts[i].attributes);
          }
          this.loading = false;
        },
        (error) => {
          this.$message({
            showClose: true,
            message: "Code " + error.code + " : " + error.rawMessage,
            type: "warning",
          });
        }
      );
    },
  },
};
</script>

<style></style>
