<template>
  <el-form :model="alipay" :rules="rules" ref="alipay" label-width="100px">
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
      <el-button type="primary" @click="submitForm('alipay')">好的，给你！</el-button>
      <el-button size="mini" type="danger" @click="resetForm('alipay')" plain>残忍拒绝</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import bus from '../eventBus'

 export default {
    data() {
      let checkNumber = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('以及交易密码~'));
        }
        if (isNaN(value)) {
          callback(new Error('我记得交易密码是纯数字吧！'));
        } else {
          if (value.length != 6) {
            callback(new Error('交易密码是六位吧！'));
          } else {
            callback();
          }
        }
      }
      return {
        alipay: {
          account: '',
          password: '',
          pin: ''
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
            { validator: checkNumber, trigger: 'blur' }
          ]
        }
      };
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
          self.$message({
            message: '(o゜ω゜o) 谢谢欧尼酱!',
            type: 'success',
            center: true
          });
        }, function(error) {
          // {"code":111,"rawMessage":"Invalid value type for field 'test',expect type is {:type \"Number\"},but it is '{:type \"String\"}'."}
          console.log(error)
          self.$message({
            message: 'Code ' + error.code + ' : ' + error.rawMessage,
            type: 'warning'
          })
        });
      }
    }
  }
</script>