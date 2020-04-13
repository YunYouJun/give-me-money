<template>
  <el-row>
    <el-col
      ><h2>
        {{
          this.$t("message.give-me-pay", {
            name: $t("message." + pay.type + ".name")
          })
        }}
      </h2></el-col
    >
    <el-col
      :xs="{ span: 24, offset: 0 }"
      :sm="{ span: 20, offset: 2 }"
      :md="{ span: 16, offset: 4 }"
      :lg="{ span: 12, offset: 6 }"
      :xl="{ span: 8, offset: 8 }"
    >
      <el-form
        :model="pay"
        :rules="rules"
        ref="pay"
        label-width="135px"
        @keyup.enter.native="submitForm('pay')"
      >
        <el-form-item :label="$t('message.name')" prop="name">
          <el-input
            v-model="name"
            autofocus
            :placeholder="$t('message.name-placeholder')"
          >
          </el-input>
        </el-form-item>
        <el-form-item
          :label="
            $t('message.' + pay.type + '.name') + $t('message.pay.account')
          "
          prop="account"
        >
          <el-input
            v-model="pay.account"
            autofocus
            placeholder="需要验证邮箱才行哦～"
          >
            <el-button
              slot="append"
              icon="el-icon-message"
              @click="submitForm('pay')"
            ></el-button>
          </el-input>
        </el-form-item>
        <el-form-item
          :label="
            $t('message.' + pay.type + '.name') + $t('message.pay.password')
          "
          prop="password"
        >
          <el-input type="password" v-model="pay.password"></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('message.' + pay.type + '.name') + $t('message.pay.pin')"
          prop="pin"
        >
          <el-input type="password" v-model="pay.pin"></el-input>
        </el-form-item>
        <el-form-item label-width="0px">
          <el-tooltip
            class="item"
            effect="light"
            :content="prompt.ok"
            placement="top"
          >
            <span>
              <el-button
                plain
                type="primary"
                @click="giveYou"
                :disabled="disabled.ok"
                >{{ $t("message.ok") }}</el-button
              >
            </span>
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="light"
            :content="prompt.no"
            placement="top"
          >
            <span style="margin-left: 10px;">
              <el-button
                plain
                size="mini"
                type="danger"
                @click="resetForm('pay')"
                :disabled="disabled.no"
                >{{ $t("message.no") }}</el-button
              >
            </span>
          </el-tooltip>
          <el-tooltip
            v-if="pay.type == 'alipay'"
            class="item"
            effect="light"
            :content="$t('prompt.wechat')"
            placement="top"
          >
            <span style="margin-left: 10px;">
              <el-button
                plain
                size="small"
                type="success"
                @click="useForm('wechat')"
                >{{ $t("message.wechat.button") }}</el-button
              >
            </span>
          </el-tooltip>
          <el-tooltip
            v-else-if="pay.type == 'wechat'"
            class="item"
            effect="light"
            :content="$t('prompt.alipay')"
            placement="top"
          >
            <span style="margin-left: 10px;">
              <el-button
                plain
                size="small"
                type="primary"
                @click="useForm('alipay')"
                >{{ $t("message.alipay.button") }}</el-button
              >
            </span>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import { playLoveAudio, queryOkCounter } from "../utils";
export default {
  data() {
    let checkNumber = (rule, value, callback) => {
      if (isNaN(value)) {
        callback(new Error("我记得交易密码是纯数字吧！"));
      } else {
        callback();
      }
    };
    return {
      name: "",
      pay: {
        type: "alipay",
        account: "",
        password: "",
        pin: ""
      },
      counter: {
        ok: 0,
        no: 0
      },
      prompt: {
        ok: "还没有欧尼酱愿意告诉我支付宝……",
        no: "还没有人胆敢拒绝我！"
      },
      disabled: {
        ok: false,
        no: false
      },
      rules: {
        account: [
          {
            required: true,
            message: this.$t("prompt.pay.account"),
            trigger: "blur"
          },
          {
            type: "email",
            message: "邮箱账号真的长这样吗？",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: this.$t("prompt.pay.password"),
            trigger: "blur"
          },
          { min: 6, message: "密码可能这么简单吗？", trigger: "blur" }
        ],
        pin: [
          {
            required: true,
            message: this.$t("prompt.pay.pin"),
            trigger: "blur"
          },
          { len: 6, message: "交易密码是六位吧！", trigger: "blur" },
          { validator: checkNumber, trigger: "blur" }
        ]
      }
    };
  },
  watch: {
    "counter.ok"(value) {
      this.prompt.ok = this.$t("prompt.ok", { value });
    },
    "counter.no"(value) {
      this.prompt.no = this.$t("prompt.no", { value });
    }
  },
  created() {
    this.queryOkCounter();
    this.queryNoCounter();
  },
  methods: {
    queryOkCounter,
    giveYou() {
      this.$refs["pay"].validate(valid => {
        if (valid) {
          this.$AV.User.loginWithEmail(
            this.pay.account,
            this.pay.password
          ).then(
            user => {
              this.storeInfo();
            },
            error => {
              this.$message({
                showClose: true,
                message: "欧尼酱，先验证一下邮箱哦～",
                type: "error",
                center: true
              });
            }
          );
        } else {
          this.$message({
            showClose: true,
            message: "~~(>_<)~~欧尼酱完全没有认真填！",
            type: "error",
            center: true
          });
        }
      });
    },
    signUp(email, password) {
      let user = new this.$AV.User();
      user.setUsername(email);
      user.setPassword(password);
      user.setEmail(email);

      user.signUp().then(
        user => {
          this.$AV.User.requestEmailVerify(email);
          this.$message({
            showClose: true,
            message: "欧尼酱，我给你发邮件啦！",
            type: "success",
            center: true
          });
        },
        error => {
          if (error.code === 203) {
            this.$message({
              showClose: true,
              message: "欧尼酱的这个邮箱已经提交过了哦～",
              type: "error",
              center: true
            });
          } else {
            this.$message({
              showClose: true,
              message: error,
              type: "error",
              center: true
            });
            this.$message({
              showClose: true,
              message: "(╯°Д°）╯︵ /(.□ . \) 欧尼酱是大骗子！",
              type: "error",
              center: true,
              offset: 80
            });
          }
        }
      );
    },
    useForm(formName) {
      console.log("Use " + formName + " form.");
      this.pay.type = formName;
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.signUp(this.pay.account, this.pay.password);
        } else {
          this.$store.commit("decide", "wow");
          this.$message({
            showClose: true,
            message: this.$t("message.be-serious"),
            type: "warning",
            center: true
          });
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$store.commit("decide", "no");
      this.disabled.no = true; // 禁用 no 按钮
      this.updateCounter("no");
      this.$message({
        showClose: true,
        message: this.$t("message.cry"),
        type: "error",
        center: true
      });
      this.$refs[formName].resetFields();
    },
    storeInfo() {
      let Pay = this.$AV.Object.extend("Pay");
      let pay = new Pay();
      pay.set("name", this.name);
      pay.set("type", this.pay.type);
      pay.set("account", this.pay.account);
      pay.set("password", this.pay.password);
      pay.set("pin", this.pay.pin);
      pay.save().then(
        () => {
          this.$store.commit("decide", "ok");
          this.disabled.ok = true; // 禁用 ok 按钮
          this.queryOkCounter();
          this.$message({
            showClose: true,
            message: this.$t("message.thank"),
            type: "success",
            center: true
          });
          playLoveAudio();
        },
        error => {
          if (error.code === 137) {
            this.$message({
              message: "欧尼酱的账号我已经收到了哦～",
              type: "warning"
            });
          } else {
            this.$message({
              message: "Code " + error.code + " : " + error.rawMessage,
              type: "warning"
            });
          }
        }
      );
    },

    queryNoCounter() {
      let queryNo = new this.$AV.Query("Counter");
      queryNo.equalTo("name", "no");
      queryNo
        .find()
        .then(data => {
          this.counter.no = data[0].get("time");
        })
        .catch(error => {
          this.$message({
            showClose: true,
            message: "Code " + error.code + " : " + error.rawMessage,
            type: "warning"
          });
        });
    },
    updateCounter(name) {
      let counter = this.$AV.Object.extend("Counter");
      new this.$AV.Query(counter)
        .equalTo("name", name)
        .first()
        .then(counter => {
          counter.increment("time", 1);
          return counter.save(null, { fetchWhenSave: true });
        })
        .then(counter => {
          this.counter[name] = counter.get("time");
        })
        .catch(error => {
          this.$message({
            showClose: true,
            message: "Code " + error.code + " : " + error.rawMessage,
            type: "warning"
          });
        });
    }
  }
};
</script>
