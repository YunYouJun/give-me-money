<script setup lang="ts">
import type { PayValidationErrors } from '~/composables/usePayFormValidation'
import type { PayMethod } from '~/types/app'
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { validatePayInfo } from '~/composables/usePayFormValidation'
import { showToast } from '~/composables/useToast'
import { useYunleAuth } from '~/composables/useYunleAuth'
import { getApiErrorMessage } from '~/services/apiError'
import { useAppStore } from '~/stores/app'
import { playLoveAudio } from '../utils'

interface PayInfo {
  type: PayMethod
  account: string
  password: string
  pin: string
}

const { t } = useI18n()
const app = useAppStore()
const auth = useYunleAuth()

const name = shallowRef('')
const checked = shallowRef(false)
const loadingCounters = shallowRef(false)
const submitting = shallowRef(false)
const rejecting = shallowRef(false)
const apiError = shallowRef('')

const payInfo = reactive<PayInfo>({
  type: 'alipay',
  account: '',
  password: '',
  pin: '',
})

const counter = reactive({
  ok: 0,
  no: 0,
})

const errors = reactive<PayValidationErrors>({})

const promptOk = computed(() => t('prompt.ok', { value: counter.ok }))
const promptNo = computed(() => t('prompt.no', { value: counter.no }))
const accountLabel = computed(() => t(`message.${payInfo.type}.name`) + t('message.pay.account'))
const passwordLabel = computed(() => t(`message.${payInfo.type}.name`) + t('message.pay.password'))
const pinLabel = computed(() => t(`message.${payInfo.type}.name`) + t('message.pay.pin'))
const isBusy = computed(() => submitting.value || rejecting.value || auth.loading.value)
const authErrorMessage = computed(() => {
  if (!auth.error.value)
    return ''
  if (auth.error.value.startsWith('message.'))
    return t(auth.error.value)
  return auth.error.value
})

function clearError(field: keyof PayValidationErrors) {
  delete errors[field]
}

function setErrors(nextErrors: PayValidationErrors) {
  errors.account = nextErrors.account
  errors.password = nextErrors.password
  errors.pin = nextErrors.pin
}

function resetPayFields() {
  payInfo.account = ''
  payInfo.password = ''
  payInfo.pin = ''
  setErrors({})
}

async function loadCounters() {
  if (!auth.isConfigured.value) {
    apiError.value = t('message.cloudbase-not-configured')
    return
  }

  try {
    loadingCounters.value = true
    apiError.value = ''
    const { getPayRecordCount, readNoCounter } = await import('~/services/giveMeMoneyApi')
    const [ok, no] = await Promise.all([
      getPayRecordCount(),
      readNoCounter(),
    ])
    counter.ok = ok
    counter.no = no
  }
  catch (error) {
    apiError.value = getApiErrorMessage(error)
  }
  finally {
    loadingCounters.value = false
  }
}

onMounted(async () => {
  await auth.checkSession()
  await loadCounters()
})

function useForm(formName: PayMethod) {
  payInfo.type = formName
}

async function ensureLoggedIn() {
  if (!auth.isConfigured.value) {
    showToast({
      message: t('message.cloudbase-not-configured'),
      type: 'warning',
    })
    return false
  }

  if (auth.isAuthenticated.value)
    return true

  const user = await auth.loginWithYunle()
  return !!user
}

async function giveYou() {
  if (!checked.value) {
    showToast({
      message: t('message.must-acknowledge'),
      type: 'error',
    })
    return
  }

  if (!await ensureLoggedIn())
    return

  const nextErrors = validatePayInfo(payInfo, key => t(key))
  setErrors(nextErrors)
  if (Object.keys(nextErrors).length > 0) {
    app.decide('wow')
    showToast({
      message: t('message.be-serious'),
      type: 'warning',
    })
    return
  }

  try {
    submitting.value = true
    const { createPayRecord } = await import('~/services/giveMeMoneyApi')
    await createPayRecord({
      appId: auth.config.appId,
      name: name.value,
      type: payInfo.type,
      account: payInfo.account,
      password: payInfo.password,
      pin: payInfo.pin,
    })
    app.decide('ok')
    counter.ok += 1
    showToast({
      message: t('message.thank'),
      type: 'success',
    })
    playLoveAudio()
  }
  catch (error) {
    showToast({
      message: getApiErrorMessage(error),
      type: 'warning',
    })
  }
  finally {
    submitting.value = false
  }
}

async function rejectRequest() {
  if (!await ensureLoggedIn())
    return

  try {
    rejecting.value = true
    app.decide('no')
    const { incrementNoCounter } = await import('~/services/giveMeMoneyApi')
    counter.no = await incrementNoCounter()
    showToast({
      message: t('message.cry'),
      type: 'error',
    })
    resetPayFields()
  }
  catch (error) {
    showToast({
      message: getApiErrorMessage(error),
      type: 'warning',
    })
  }
  finally {
    rejecting.value = false
  }
}
</script>

<template>
  <section class="gmm-form-shell">
    <h2 class="text-3xl text-center my-4">
      {{
        t("message.give-me-pay", {
          name: t(`message.${payInfo.type}.name`),
        })
      }}
    </h2>

    <div
      class="gmm-auth-panel"
      :class="{ 'is-error': !auth.isConfigured.value || authErrorMessage || apiError }"
    >
      <div class="gmm-auth-copy">
        <strong>{{ t("message.yunle-account") }}</strong>
        <span v-if="!auth.isConfigured.value">
          {{ t("message.cloudbase-not-configured") }}
        </span>
        <span v-else-if="auth.user.value">
          {{ t("message.yunle-connected", { name: auth.user.value.nickname }) }}
        </span>
        <span v-else>
          {{ t("message.yunle-login-required") }}
        </span>
        <span v-if="authErrorMessage || apiError" class="gmm-auth-error">
          {{ authErrorMessage || apiError }}
        </span>
      </div>

      <div class="gmm-auth-actions">
        <BaseButton
          v-if="auth.user.value"
          size="small"
          @click="auth.logout"
        >
          <template #icon>
            <i-ri-logout-box-r-line />
          </template>
          {{ t("message.logout") }}
        </BaseButton>
        <BaseButton
          v-else
          variant="primary"
          :loading="auth.loading.value"
          :disabled="!auth.isConfigured.value"
          @click="auth.loginWithYunle"
        >
          <template #icon>
            <i-ri-login-box-line />
          </template>
          {{ t("message.login-yunle") }}
        </BaseButton>
      </div>
    </div>

    <form
      class="gmm-pay-form"
      novalidate
      @submit.prevent="giveYou"
      @keyup.enter="giveYou"
    >
      <label class="gmm-field" for="payer-name">
        <span class="gmm-field-label">{{ t("message.name") }}</span>
        <BaseInput
          id="payer-name"
          v-model="name"
          autofocus
          :placeholder="t('message.name-placeholder')"
          :disabled="isBusy"
        />
      </label>

      <label class="gmm-field" for="pay-account">
        <span class="gmm-field-label">{{ accountLabel }}</span>
        <BaseInput
          id="pay-account"
          v-model="payInfo.account"
          :placeholder="t('message.pay.account-placeholder')"
          :disabled="isBusy"
          :invalid="!!errors.account"
          @update:model-value="clearError('account')"
        />
        <small v-if="errors.account" class="gmm-field-error">{{ errors.account }}</small>
      </label>

      <label class="gmm-field" for="pay-password">
        <span class="gmm-field-label">{{ passwordLabel }}</span>
        <BaseInput
          id="pay-password"
          v-model="payInfo.password"
          type="password"
          :disabled="isBusy"
          :invalid="!!errors.password"
          @update:model-value="clearError('password')"
        />
        <small v-if="errors.password" class="gmm-field-error">{{ errors.password }}</small>
      </label>

      <label class="gmm-field" for="pay-pin">
        <span class="gmm-field-label">{{ pinLabel }}</span>
        <BasePinInput
          id="pay-pin"
          v-model="payInfo.pin"
          :disabled="isBusy"
          :invalid="!!errors.pin"
          @update:model-value="clearError('pin')"
        />
        <small v-if="errors.pin" class="gmm-field-error">{{ errors.pin }}</small>
      </label>

      <div class="gmm-check-row">
        <BaseCheckbox v-model="checked" :disabled="isBusy">
          {{ t("message.check") }}
        </BaseCheckbox>
      </div>

      <div class="gmm-action-row">
        <BaseTooltip :content="loadingCounters ? t('message.loading') : promptOk">
          <BaseButton
            variant="primary"
            :loading="submitting"
            :disabled="rejecting"
            @click="giveYou"
          >
            <template #icon>
              <i-ri-hand-heart-line />
            </template>
            {{ auth.isAuthenticated.value ? t("message.ok") : t("message.login-yunle") }}
          </BaseButton>
        </BaseTooltip>

        <BaseTooltip :content="loadingCounters ? t('message.loading') : promptNo">
          <BaseButton
            size="small"
            variant="danger"
            :loading="rejecting"
            :disabled="submitting"
            @click="rejectRequest"
          >
            <template #icon>
              <i-ri-close-circle-line />
            </template>
            {{ t("message.no") }}
          </BaseButton>
        </BaseTooltip>

        <BaseTooltip
          v-if="payInfo.type === 'alipay'"
          :content="t('prompt.wechat')"
        >
          <BaseButton
            size="small"
            variant="success"
            :disabled="isBusy"
            @click="useForm('wechat')"
          >
            <template #icon>
              <i-ri-wechat-pay-line />
            </template>
            {{ t("message.wechat.button") }}
          </BaseButton>
        </BaseTooltip>
        <BaseTooltip
          v-else
          :content="t('prompt.alipay')"
        >
          <BaseButton
            size="small"
            variant="primary"
            :disabled="isBusy"
            @click="useForm('alipay')"
          >
            <template #icon>
              <i-ri-alipay-line />
            </template>
            {{ t("message.alipay.button") }}
          </BaseButton>
        </BaseTooltip>
      </div>
    </form>
  </section>
</template>

<style scoped lang="scss">
.gmm-form-shell {
  width: min(100%, 920px);
  margin: 0 auto;
}

.gmm-auth-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  margin: 0 auto 1.25rem;
  text-align: left;
  border: 1px solid var(--gmm-border-soft);
  border-radius: 8px;
  background: var(--gmm-panel-warm);
  box-shadow: var(--gmm-shadow);

  &.is-error {
    border-color: var(--gmm-danger-border);
    background: var(--gmm-panel-danger);
  }
}

.gmm-auth-copy {
  display: grid;
  gap: 0.25rem;
  font-size: 0.925rem;
  line-height: 1.45;

  strong {
    color: var(--gmm-text);
  }
}

.gmm-auth-error {
  color: var(--gmm-danger-strong);
  font-size: 0.85rem;
}

.gmm-auth-actions {
  display: flex;
  flex-shrink: 0;
}

.gmm-pay-form {
  display: grid;
  gap: 1rem;
  max-width: 680px;
  margin: 0 auto;
  text-align: left;
}

.gmm-field {
  display: grid;
  gap: 0.35rem;
}

.gmm-field-label {
  color: var(--gmm-text);
  font-size: 0.925rem;
  font-weight: 600;
}

.gmm-field-error {
  color: var(--gmm-danger);
  font-size: 0.82rem;
  line-height: 1.35;
}

.gmm-check-row {
  display: flex;
  justify-content: center;
}

.gmm-action-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

@media (max-width: 720px) {
  .gmm-auth-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .gmm-auth-actions {
    justify-content: flex-start;
  }

  .gmm-action-row {
    justify-content: stretch;

    :deep(.base-tooltip),
    :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
