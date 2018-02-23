<template>
  <el-form :model="alipay" :rules="rules" ref="alipay" label-width="100px" @keyup.enter.native="submitForm('alipay')">
    <el-form-item label="支付宝账号" prop="account">
      <el-input v-model="alipay.account" autofocus></el-input>
    </el-form-item>
    <el-form-item label="支付宝密码" prop="password">
      <el-input type="password" v-model="alipay.password"></el-input>
    </el-form-item>
    <el-form-item label="交易密码" prop="pin">
      <el-input type="password" v-model="alipay.pin"></el-input>
    </el-form-item>
    <el-form-item label-width="0px">
      <el-tooltip class="item" effect="light" :content="prompt.ok" placement="top">
        <el-button type="primary" @click="submitForm('alipay')">好的，给你！</el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="light" :content="prompt.no" placement="top">
        <el-button size="mini" type="danger" @click="resetForm('alipay')" plain>残忍拒绝</el-button>
      </el-tooltip>
    </el-form-item>
  </el-form>
</template>

<script>
import bus from '../eventBus'

 export default {
    data() {
      let checkNumber = (rule, value, callback) => {
        if (isNaN(value)) {
          callback(new Error('我记得交易密码是纯数字吧！'));
        } else {
          callback();
        }
      }
      return {
        alipay: {
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
        rules: {
          account: [
            { required: true, message: '请给我支付宝账号~', trigger: 'blur' },
            { min: 6, message: '支付宝账号有这么简单吗？', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '还有支付宝密码~', trigger: 'blur' },
            { min: 6, message: '支付宝密码可能这么简单吗？', trigger: 'blur' }
          ],
          pin: [
            { required: true, message: '以及交易密码~', trigger: 'blur' },
            { len: 6, message: '交易密码是六位吧！', trigger: 'blur' },
            { validator: checkNumber, trigger: 'blur' }
          ]
        }
      };
    },
    watch: {
      'counter.ok' (value) {
        this.prompt.ok = '已经有' + value + '个欧尼酱告诉我啦！'
      },
      'counter.no' (value) {
        this.prompt.no = '已被残忍拒绝' + value + '次！'
      }
    },
    created () {
      this.queryCounter()
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.storeInfo()
          } else {
            this.$message({
              message: '(σ‘・д・)σ 给我认真填啦!',
              type: 'warning',
              center: true
            });
            return false;
          }
        });
      },
      resetForm(formName) {
        bus.$emit('no')
        this.updateCounter('no')
        this.$message({
          message: '〒▽〒 呜呜呜~',
          type: 'error',
          center: true
        });
        this.$refs[formName].resetFields();
      },
      storeInfo () {
        let self = this
        let Alipay = AV.Object.extend("alipay")
        let alipay = new Alipay()
        alipay.set('account', this.alipay.account)
        alipay.set('password', this.alipay.password)
        alipay.set('pin', this.alipay.pin)
        alipay.save().then(function() {
          bus.$emit('ok')
          self.updateCounter('ok')
          self.$message({
            message: '(o゜ω゜o) 谢谢欧尼酱!',
            type: 'success',
            center: true
          });
        }, function(error) {
          self.$message({
            message: 'Code ' + error.code + ' : ' + error.rawMessage,
            type: 'warning'
          })
        })
      },
      queryCounter () {
        let self = this

        let queryOK = new AV.Query('counter');
        queryOK.equalTo('name', 'ok');
        queryOK.find().then(function (data) {
          self.counter.ok = data[0].get('time')
        }).catch(function(error) {
          self.$message({
            message: 'Code ' + error.code + ' : ' + error.rawMessage,
            type: 'warning'
          })
        })

        let queryNO = new AV.Query('counter');
        queryNO.equalTo('name', 'no');
        queryNO.find().then(function (data) {
          self.counter.no = data[0].get('time')
        }).catch(function(error) {
          self.$message({
            message: 'Code ' + error.code + ' : ' + error.rawMessage,
            type: 'warning'
          })
        })
      },
      updateCounter (name) {
        let self = this
        let counter = AV.Object.extend('counter');
        new AV.Query(counter).equalTo('name', name).first().then(function(counter) {
          counter.increment('time', 1);
          return counter.save()
        }).then(function(counter) {
          self.counter[name] = counter.get('time')
        }).catch(function(error) {
          console.log(error)
          self.$message({
            message: 'Code ' + error.code + ' : ' + error.rawMessage,
            type: 'warning'
          })
        })
      }
    }
  }
</script>