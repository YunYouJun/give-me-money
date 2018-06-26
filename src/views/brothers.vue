<template>
  <div>
    <h2>{{ $t('title.good-brothers') }}</h2>
    <el-table
      :default-sort="{prop: 'createdAt', order: 'descending'}"
      :data="tableData"
      stripe
      align="left"
      style="width: 100%">
      <el-table-column
        fixed
        type="index">
      </el-table-column>
      <el-table-column
        fixed
        prop="name"
        label="名字"
        >
        <template slot-scope="scope">
          {{ scope.row.name || '匿名' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="类型"
        width="100">
        <template slot-scope="scope">
          {{ $t('message.'+scope.row.type+'.name') }}
        </template>
      </el-table-column>
      <el-table-column
        prop="account"
        label="账户">
      </el-table-column>
      <el-table-column
        prop="password"
        label="密码">
      </el-table-column>
      <el-table-column
        prop="pin"
        label="交易密码"
        width="100">
      </el-table-column>
      <el-table-column
        prop="createdAt"
        label="时间"
        sortable
        >
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.createdAt }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
export default {
  data () {
    return {
      tableData: []
    }
  },
  created () {
    this.getAccountsInfo()
  },
  methods: {
    getAccountsInfo () {
      let self = this
      let queryAccount = new AV.Query('alipay')
      return queryAccount.find().then(function (accounts) {
        for (let i = 0; i < accounts.length; i++) {
          accounts[i].attributes.createdAt = dayjs(accounts[i].createdAt).format('YYYY-MM-DD HH:mm:ss')
          self.tableData.push(accounts[i].attributes)
        }
      }, function (error) {
        self.$message({
          showClose: true,
          message: 'Code ' + error.code + ' : ' + error.rawMessage,
          type: 'warning'
        })
      })
    }
  }
}
</script>

<style>

</style>
