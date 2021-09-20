<template>
  <div style="max-width: 1000px; margin: auto">
    <h2 :style="{ textAlign: 'center' }">
      {{
        t("message.give-me-pay", {
          name: t("message." + payInfo.type + ".name"),
        })
      }}
    </h2>

    <el-form
      ref="payForm"
      :model="payInfo"
      :rules="rules"
      label-width="135px"
      @keyup.enter="submitForm"
    >
      <el-form-item :label="t('message.name')" prop="name">
        <el-input
          v-model="name"
          autofocus
          :placeholder="t('message.name-placeholder')"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        :label="
          t('message.' + payInfo.type + '.name') + t('message.pay.account')
        "
        prop="account"
      >
        <el-input
          v-model="payInfo.account"
          autofocus
          placeholder="需要验证邮箱才行哦～"
        >
          <template #append>
            <el-button icon="el-icon-message" @click="submitForm"></el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        :label="
          t('message.' + payInfo.type + '.name') + t('message.pay.password')
        "
        prop="password"
      >
        <el-input v-model="payInfo.password" type="password"></el-input>
      </el-form-item>
      <el-form-item
        :label="t('message.' + payInfo.type + '.name') + t('message.pay.pin')"
        prop="pin"
      >
        <el-input
          v-model="payInfo.pin"
          type="password"
          :maxlength="6"
        ></el-input>
      </el-form-item>
      <el-form-item style="text-align: center" label-width="0px">
        <el-checkbox v-model="checked">
          {{ t("message.check") }}
        </el-checkbox>
      </el-form-item>
      <el-form-item label-width="0px">
        <el-tooltip
          class="item"
          effect="light"
          :content="prompt.ok"
          placement="top"
        >
          <el-button
            plain
            type="primary"
            :disabled="disabled.ok"
            @click="giveYou"
          >
            {{ t("message.ok") }}
          </el-button>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="light"
          :content="prompt.no"
          placement="top"
        >
          <span style="margin-left: 10px">
            <el-button
              plain
              size="mini"
              type="danger"
              :disabled="disabled.no"
              @click="resetForm"
            >{{ t("message.no") }}</el-button>
          </span>
        </el-tooltip>

        <span v-show="payInfo.type === 'alipay'">
          <el-tooltip
            class="item"
            effect="light"
            :content="t('prompt.wechat')"
            placement="top"
          >
            <span style="margin-left: 10px">
              <el-button
                plain
                size="small"
                type="success"
                @click="useForm('wechat')"
              >{{ t("message.wechat.button") }}</el-button>
            </span>
          </el-tooltip>
        </span>
        <span v-show="payInfo.type === 'wechat'">
          <el-tooltip
            class="item"
            effect="light"
            :content="t('prompt.alipay')"
            placement="top"
          >
            <span style="margin-left: 10px">
              <el-button
                plain
                size="small"
                type="primary"
                @click="useForm('alipay')"
              >{{ t("message.alipay.button") }}</el-button>
            </span>
          </el-tooltip>
        </span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, reactive, onBeforeMount } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { useI18n } from 'vue-i18n'
import AV from 'leancloud-storage'
import { useStore } from 'vuex'
import { playLoveAudio, queryOkCounter, queryNoCounter } from '../utils'
const { t } = useI18n()
const store = useStore()
const payForm = ref<typeof ElForm | null>(null)

const name = ref('')
const checked = ref(false)

const payInfo = reactive({
  type: 'alipay',
  account: '',
  password: '',
  pin: '',
})

const counter = reactive({
  ok: 0,
  no: 0,
})

const disabled = reactive({
  ok: false,
  no: false,
})

const prompt = reactive({
  ok: '还没有欧尼酱愿意告诉我支付宝……',
  no: '还没有人胆敢拒绝我！',
})

const rules = {
  account: [
    {
      required: true,
      message: t('prompt.pay.account'),
      trigger: 'blur',
    },
    {
      type: 'email',
      message: '邮箱账号真的长这样吗？',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: t('prompt.pay.password'),
      trigger: 'blur',
    },
    { min: 6, message: '密码可能这么简单吗？', trigger: 'blur' },
  ],
  pin: [
    {
      required: true,
      message: t('prompt.pay.pin'),
      trigger: 'blur',
    },
    { len: 6, message: '交易密码是六位吧！', trigger: 'blur' },
    {
      validator: (
        rule: any,
        value: number,
        callback: (err: Error | null) => void,
      ) => {
        if (isNaN(value))
          callback(new Error('我记得交易密码是纯数字吧！'))

        else
          callback(null)
      },
      trigger: 'blur',
    },
  ],
}

watch(
  () => counter.ok,
  (value) => {
    prompt.ok = t('prompt.ok', { value })
  },
)

watch(
  () => counter.no,
  (value) => {
    prompt.no = t('prompt.no', { value })
  },
)

onBeforeMount(async() => {
  queryOkCounter().then((result) => {
    counter.ok = result || 0
  })
  queryNoCounter().then((result) => {
    counter.no = result
  })
})

/**
 * 存储信息
 */
function storeInfo() {
  const Pay = AV.Object.extend('Pay')
  const pay = new Pay()
  pay.set('name', name.value)
  pay.set('type', payInfo.type)
  pay.set('account', payInfo.account)
  pay.set('password', payInfo.password)
  pay.set('pin', payInfo.pin)
  pay.save().then(
    () => {
      store.commit('decide', 'ok')
      disabled.ok = true // 禁用 ok 按钮
      queryOkCounter()
      ElMessage({
        showClose: true,
        message: t('message.thank'),
        type: 'success',
        center: true,
      })
      playLoveAudio()
    },
    (error) => {
      if (error.code === 137) {
        ElMessage({
          message: '欧尼酱的账号我已经收到了哦～',
          type: 'warning',
        })
      }
      else {
        ElMessage({
          message: `Code ${error.code} : ${error.rawMessage}`,
          type: 'warning',
        })
      }
    },
  )
}

/**
 * 给你
 */
function giveYou() {
  if (checked.value) {
    payForm.value?.validate((valid: boolean) => {
      if (valid) {
        AV.User.loginWithEmail(payInfo.account, payInfo.password).then(
          (_user) => {
            storeInfo()
          },
          (_error) => {
            ElMessage({
              showClose: true,
              message: '欧尼酱，先验证一下邮箱哦～',
              type: 'error',
              center: true,
            })
          },
        )
      }
      else {
        ElMessage({
          showClose: true,
          message: '~~(>_<)~~欧尼酱完全没有认真填！',
          type: 'error',
          center: true,
        })
      }
    })
  }
  else {
    ElMessage({
      showClose: true,
      message: '请确保您已知晓这是一个恶作剧网站。',
      type: 'error',
      center: true,
    })
  }
}

interface LeanError {
  code: number
  rawMessage: string
}

/**
 * 注册
 */
function signUp(email: string, password: any) {
  const user = new AV.User()
  user.setUsername(email)
  user.setPassword(password)
  user.setEmail(email)

  user.signUp().then(
    (_user: any) => {
      AV.User.requestEmailVerify(email)
      ElMessage({
        showClose: true,
        message: '欧尼酱，我给你发邮件啦！',
        type: 'success',
        center: true,
      })
    },
    (error: LeanError) => {
      if (error.code === 203) {
        ElMessage({
          showClose: true,
          message: '欧尼酱的这个邮箱已经提交过了哦～',
          type: 'error',
          center: true,
        })
      }
      else {
        ElMessage({
          showClose: true,
          message: error.rawMessage,
          type: 'error',
          center: true,
        })
        ElMessage({
          showClose: true,
          message: '(╯°Д°）╯︵ /(.□ . \\) 欧尼酱是大骗子！',
          type: 'error',
          center: true,
          offset: 80,
        })
      }
    },
  )
}

export type PayMethod = 'alipay' | 'wechat'

/**
 * 使用表单
 */
function useForm(formName: PayMethod) {
  // console.log("Use " + formName + " form.");
  payInfo.type = formName
}

/**
 * 提交表单
 */
function submitForm() {
  payForm.value?.validate((valid: any) => {
    if (valid) {
      signUp(payInfo.account, payInfo.password)
    }
    else {
      store.commit('decide', 'wow')
      ElMessage({
        showClose: true,
        message: t('message.be-serious'),
        type: 'warning',
        center: true,
      })
      return false
    }
  })
}

function resetForm() {
  store.commit('decide', 'no')
  disabled.no = true // 禁用 no 按钮
  updateCounter('no')
  ElMessage({
    showClose: true,
    message: t('message.cry'),
    type: 'error',
    center: true,
  })
  payForm.value?.resetFields()
}

async function updateCounter(name: 'ok' | 'no') {
  const query = new AV.Query('Counter')
  try {
    const result = (await query.equalTo('name', name).first()) as AV.Object
    result.increment('time', 1)
    const updatedResult = await result.save(null, { fetchWhenSave: true })
    counter[name] = updatedResult.get('time')
  }
  catch (error) {
    ElMessage({
      showClose: true,
      message: `Code ${error.code} : ${error.rawMessage}`,
      type: 'warning',
    })
  }
}
</script>

<style lang="scss">
.el-checkbox__label {
  white-space: normal;
  text-align: left;
}
</style>
