<script setup lang="ts">
import type { PayValidationErrors } from '~/composables/usePayFormValidation'
import type { CounterName } from '~/services/giveMeMoneyApi'
import type { PayMethod } from '~/types/app'
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { validatePayInfo } from '~/composables/usePayFormValidation'
import { showToast } from '~/composables/useToast'
import { isCloudbaseReady } from '~/services/cloudbaseConfig'
import { getCommentsUrl } from '~/services/commentsConfig'
import { useAppStore } from '~/stores/app'
import { playLoveAudio } from '../utils'
import SubmissionResultDialog from './SubmissionResultDialog.vue'

interface PayInfo {
  type: PayMethod
  account: string
  password: string
  pin: string
}

const { t } = useI18n()
const app = useAppStore()
const commentsUrl = getCommentsUrl()

const name = shallowRef('')
const checked = shallowRef(false)
const loadingCounters = shallowRef(false)
const submittingCounter = shallowRef<CounterName | null>(null)
const dialogType = shallowRef<'already' | 'login' | 'reject' | 'submit' | null>(null)
const counterErrors = reactive({
  ok: '',
  no: '',
})

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

const promptOk = computed(() => counterErrors.ok || t('prompt.ok', { value: counter.ok }))
const promptNo = computed(() => counterErrors.no || t('prompt.no', { value: counter.no }))
const accountLabel = computed(() => t(`message.${payInfo.type}.name`) + t('message.pay.account'))
const passwordLabel = computed(() => t(`message.${payInfo.type}.name`) + t('message.pay.password'))
const pinLabel = computed(() => t(`message.${payInfo.type}.name`) + t('message.pay.pin'))
const isSubmittingOk = computed(() => submittingCounter.value === 'ok')
const isSubmittingNo = computed(() => submittingCounter.value === 'no')
const isSubmitting = computed(() => submittingCounter.value !== null)
const dialogTitle = computed(() => {
  if (dialogType.value === 'already')
    return t('message.already-submitted-title')
  if (dialogType.value === 'login')
    return t('message.login-required-title')
  if (dialogType.value === 'reject')
    return t('message.fake-reject-title')
  return t('message.fake-submit-title')
})
const dialogMessage = computed(() => {
  if (dialogType.value === 'already')
    return t('message.already-submitted-description')
  if (dialogType.value === 'login')
    return t('message.login-required-description')
  if (dialogType.value === 'reject')
    return t('message.fake-reject-description')
  return t('message.fake-submit-description')
})
const dialogActionLabel = computed(() => {
  if (dialogType.value === 'login')
    return t('message.login-required-action')
  if (dialogType.value === 'submit')
    return t('message.open-comments-login')
  return t('message.open-comments')
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

function setCounterErrors(ok = '', no = ok) {
  counterErrors.ok = ok
  counterErrors.no = no
}

async function loadCounters() {
  if (!isCloudbaseReady()) {
    setCounterErrors(t('message.counter-unavailable'))
    return
  }

  try {
    loadingCounters.value = true
    setCounterErrors()
    const { readNoCounter, readOkCounter } = await import('~/services/giveMeMoneyApi')
    const [okResult, noResult] = await Promise.allSettled([
      readOkCounter(),
      readNoCounter(),
    ])
    if (okResult.status === 'fulfilled')
      counter.ok = okResult.value
    else
      counterErrors.ok = t('message.counter-unavailable')

    if (noResult.status === 'fulfilled')
      counter.no = noResult.value
    else
      counterErrors.no = t('message.counter-unavailable')
  }
  catch {
    setCounterErrors(t('message.counter-unavailable'))
  }
  finally {
    loadingCounters.value = false
  }
}

onMounted(loadCounters)

function useForm(formName: PayMethod) {
  payInfo.type = formName
}

function closeDialog() {
  dialogType.value = null
}

async function recordCounter(counterName: CounterName): Promise<boolean> {
  if (submittingCounter.value)
    return false

  submittingCounter.value = counterName
  try {
    const api = await import('~/services/giveMeMoneyApi')
    const result = await api.submitCounterVote(counterName)
    counter[counterName] = result.value
    setCounterErrors()
    showToast({
      message: t('message.counter-recorded'),
      type: 'success',
    })
    return true
  }
  catch (error) {
    const api = await import('~/services/giveMeMoneyApi')
    if (error instanceof api.CounterLoginRequiredError) {
      dialogType.value = 'login'
      showToast({
        message: t('message.login-required-toast'),
        type: 'warning',
      })
      return false
    }

    if (error instanceof api.CounterAlreadySubmittedError) {
      dialogType.value = 'already'
      showToast({
        message: t('message.already-submitted-toast'),
        type: 'warning',
      })
      return false
    }

    showToast({
      message: t('message.counter-record-failed', {
        reason: api.getApiErrorMessage(error),
      }),
      type: 'error',
    })
    return false
  }
  finally {
    submittingCounter.value = null
  }
}

async function giveYou() {
  if (!checked.value) {
    showToast({
      message: t('message.must-acknowledge'),
      type: 'error',
    })
    return
  }

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

  const recorded = await recordCounter('ok')
  if (!recorded) {
    resetPayFields()
    return
  }

  app.decide('ok')
  dialogType.value = 'submit'
  resetPayFields()
  playLoveAudio()
}

async function rejectRequest() {
  const recorded = await recordCounter('no')
  if (!recorded) {
    resetPayFields()
    return
  }

  app.decide('no')
  dialogType.value = 'reject'
  resetPayFields()
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
        />
      </label>

      <label class="gmm-field" for="pay-account">
        <span class="gmm-field-label">{{ accountLabel }}</span>
        <BaseInput
          id="pay-account"
          v-model="payInfo.account"
          :placeholder="t('message.pay.account-placeholder')"
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
          :invalid="!!errors.pin"
          @update:model-value="clearError('pin')"
        />
        <small v-if="errors.pin" class="gmm-field-error">{{ errors.pin }}</small>
      </label>

      <div class="gmm-check-row">
        <BaseCheckbox v-model="checked">
          {{ t("message.check") }}
        </BaseCheckbox>
      </div>

      <div class="gmm-action-row">
        <BaseTooltip
          class="gmm-action-tooltip gmm-action-tooltip--ok"
          :content="loadingCounters ? t('message.loading') : promptOk"
        >
          <BaseButton
            class="gmm-action-button--ok"
            variant="primary"
            :disabled="isSubmitting"
            :loading="isSubmittingOk"
            @click="giveYou"
          >
            <template #icon>
              <i-ri-hand-heart-line />
            </template>
            {{ t("message.ok") }}
          </BaseButton>
        </BaseTooltip>

        <BaseTooltip
          class="gmm-action-tooltip gmm-action-tooltip--reject"
          :content="loadingCounters ? t('message.loading') : promptNo"
        >
          <BaseButton
            class="gmm-action-button--reject"
            size="small"
            variant="danger"
            :disabled="isSubmitting"
            :loading="isSubmittingNo"
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
    <SubmissionResultDialog
      v-if="dialogType"
      :title="dialogTitle"
      :message="dialogMessage"
      :comments-url="commentsUrl"
      :action-label="dialogActionLabel"
      @close="closeDialog"
    />
  </section>
</template>

<style scoped lang="scss">
.gmm-form-shell {
  width: min(100%, 920px);
  margin: 0 auto;
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
  align-items: center;
  gap: 0.75rem;
}

.gmm-action-tooltip--ok {
  flex: 0 1 12rem;
}

.gmm-action-tooltip--reject {
  flex: 0 1 auto;
}

.gmm-action-button--ok {
  width: 100%;
  min-height: 3rem;
  padding: 0.7rem 1.35rem;
  font-size: 1.0625rem;
  font-weight: 700;
  border-width: 2px;
}

.gmm-action-button--reject {
  min-width: 6.5rem;
}

@media (max-width: 720px) {
  .gmm-action-row {
    justify-content: stretch;

    .gmm-action-tooltip {
      flex: 1 1 100%;
    }

    :deep(.base-tooltip),
    :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
