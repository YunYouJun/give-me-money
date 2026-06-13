<script setup lang="ts">
import type { PayValidationErrors } from '~/composables/usePayFormValidation'
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
const dialogType = shallowRef<'submit' | 'reject' | null>(null)
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
const dialogTitle = computed(() => {
  if (dialogType.value === 'reject')
    return t('message.fake-reject-title')
  return t('message.fake-submit-title')
})
const dialogMessage = computed(() => {
  if (dialogType.value === 'reject')
    return t('message.fake-reject-description')
  return t('message.fake-submit-description')
})
const dialogActionLabel = computed(() => {
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

function giveYou() {
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

  app.decide('ok')
  dialogType.value = 'submit'
  resetPayFields()
  playLoveAudio()
}

function rejectRequest() {
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
        <BaseTooltip :content="loadingCounters ? t('message.loading') : promptOk">
          <BaseButton
            variant="primary"
            @click="giveYou"
          >
            <template #icon>
              <i-ri-hand-heart-line />
            </template>
            {{ t("message.ok") }}
          </BaseButton>
        </BaseTooltip>

        <BaseTooltip :content="loadingCounters ? t('message.loading') : promptNo">
          <BaseButton
            size="small"
            variant="danger"
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
  gap: 0.75rem;
}

@media (max-width: 720px) {
  .gmm-action-row {
    justify-content: stretch;

    :deep(.base-tooltip),
    :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
