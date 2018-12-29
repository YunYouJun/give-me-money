<template>
  <el-form :model="pay" :rules="rules" ref="pay" label-width="120px" @keyup.enter.native="submitForm('pay')">
    <el-form-item :label="$t('message.name')" prop="name">
      <el-input v-model="name" autofocus></el-input>
    </el-form-item>
    <el-form-item :label="$t('message.' + pay.type + '.name') + $t('message.pay.account')" prop="account">
      <el-input v-model="pay.account" autofocus></el-input>
    </el-form-item>
    <el-form-item :label="$t('message.' + pay.type + '.name') + $t('message.pay.password')" prop="password">
      <el-input type="password" v-model="pay.password"></el-input>
    </el-form-item>
    <el-form-item :label="$t('message.' + pay.type + '.name') + $t('message.pay.pin')" prop="pin">
      <el-input type="password" v-model="pay.pin"></el-input>
    </el-form-item>
    <el-form-item label-width="0px">
      <el-tooltip class="item" effect="light" :content="prompt.ok" placement="top">
        <span>
          <el-button plain type="primary" @click="submitForm('pay')" :disabled="disabled.ok">{{ $t('message.ok') }}</el-button>
        </span>
      </el-tooltip>
      <el-tooltip class="item" effect="light" :content="prompt.no" placement="top">
        <span style="margin-left: 20px;">
          <el-button plain size="mini" type="danger" @click="resetForm('pay')" :disabled="disabled.no">{{ $t('message.no') }}</el-button>
        </span>
      </el-tooltip>
      <el-tooltip v-if="pay.type=='alipay'" class="item" effect="light" :content="$t('prompt.wechat')" placement="top">
        <span style="margin-left: 20px;">
          <el-button plain size="small" type="success" @click="useForm('wechat')">{{ $t('message.wechat.button') }}</el-button>
        </span>
      </el-tooltip>
      <el-tooltip v-else-if="pay.type=='wechat'" class="item" effect="light" :content="$t('prompt.alipay')" placement="top">
        <span style="margin-left: 20px;">
          <el-button plain size="small" type="primary" @click="useForm('alipay')">{{ $t('message.alipay.button') }}</el-button>
        </span>
      </el-tooltip>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    let checkNumber = (rule, value, callback) => {
      if (isNaN(value)) {
        callback(new Error('我记得交易密码是纯数字吧！'))
      } else {
        callback()
      }
    }
    return {
      name: '',
      pay: {
        type: 'alipay',
        account: '',
        password: '',
        pin: ''
      },
      counter: {
        ok: 0,
        no: 0
      },
      prompt: {
        ok: '还没有欧尼酱愿意告诉我支付宝……',
        no: '还没有人胆敢拒绝我！'
      },
      disabled: {
        ok: false,
        no: false
      },
      rules: {
        account: [
          { required: true, message: this.$t('prompt.pay.account'), trigger: 'blur' },
          { min: 6, message: '账号有这么简单吗？', trigger: 'blur' }
        ],
        password: [
          { required: true, message: this.$t('prompt.pay.password'), trigger: 'blur' },
          { min: 6, message: '密码可能这么简单吗？', trigger: 'blur' }
        ],
        pin: [
          { required: true, message: this.$t('prompt.pay.pin'), trigger: 'blur' },
          { len: 6, message: '交易密码是六位吧！', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    'counter.ok' (value) {
      this.prompt.ok = this.$t('prompt.ok', {value})
    },
    'counter.no' (value) {
      this.prompt.no = this.$t('prompt.no', {value})
    }
  },
  created () {
    this.queryOkCounter()
    this.queryNoCounter()
  },
  methods: {
    useForm(formName) {
      console.log('Use ' + formName + ' form.')
      this.pay.type = formName
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.storeInfo()
        } else {
          this.$store.commit('decide', 'wow')
          this.$message({
            showClose: true,
            message: this.$t('message.be-serious'),
            type: 'warning',
            center: true
          })
          return false
        }
      })
    },
    resetForm(formName) {
      this.$store.commit('decide', 'no')
      this.disabled.no = true // 禁用 no 按钮
      this.updateCounter('no')
      this.$message({
        showClose: true,
        message: this.$t('message.cry'),
        type: 'error',
        center: true
      })
      this.$refs[formName].resetFields()
    },
    storeInfo () {
      let self = this
      let Pay = AV.Object.extend("alipay")
      let pay = new Pay()
      pay.set('name', this.name)
      pay.set('type', this.pay.type)
      pay.set('account', this.pay.account)
      pay.set('password', this.pay.password)
      pay.set('pin', this.pay.pin)
      pay.save().then(function() {
        self.$store.commit('decide', 'ok')
        self.disabled.ok = true // 禁用 ok 按钮
        self.queryOkCounter()
        self.$message({
          showClose: true,
          message: self.$t('message.thank'),
          type: 'success',
          center: true
        })
      }, function(error) {
        self.$message({
          message: 'Code ' + error.code + ' : ' + error.rawMessage,
          type: 'warning'
        })
      })
    },
    queryOkCounter () {
      let self = this
      let queryPay = new AV.Query('alipay')
      queryPay.count().then(function (count) {
        self.counter.ok = count
      }, function (error) {
        self.$message({
          showClose: true,
          message: 'Code ' + error.code + ' : ' + error.rawMessage,
          type: 'warning'
        })
      })
    },
    queryNoCounter () {
      let self = this
      let queryNo = new AV.Query('counter')
      queryNo.equalTo('name', 'no')
      queryNo.find().then(function (data) {
        self.counter.no = data[0].get('time')
      }).catch(function(error) {
        self.$message({
          showClose: true,
          message: 'Code ' + error.code + ' : ' + error.rawMessage,
          type: 'warning'
        })
      })
    },
    updateCounter (name) {
      let self = this
      let counter = AV.Object.extend('counter')
      new AV.Query(counter).equalTo('name', name).first()
      .then(function(counter) {
        counter.increment('time', 1)
        return counter.save(null, {fetchWhenSave: true})
      }).then(function(counter) {
        self.counter[name] = counter.get('time')
      }).catch(function(error) {
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