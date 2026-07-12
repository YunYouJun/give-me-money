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
import { ensureYunleCloudbaseSession, redirectToYunleLogin } from '~/services/yunleSso'
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
const dialogType = shallowRef<'already' | 'reject' | 'submit' | null>(null)
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
  if (dialogType.value === 'reject')
    return t('message.fake-reject-title')
  return t('message.fake-submit-title')
})
const dialogMessage = computed(() => {
  if (dialogType.value === 'already')
    return t('message.already-submitted-description')
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

async function warmUpYunleSession() {
  try {
    await ensureYunleCloudbaseSession({ mode: 'silent' })
  }
  catch {
    // The page can still show public counters and ask for login during submit.
  }
}

onMounted(() => {
  void loadCounters()
  void warmUpYunleSession()
})

function useForm(formName: PayMethod) {
  payInfo.type = formName
}

function closeDialog() {
  dialogType.value = null
}

async function promptYunleLogin(): Promise<boolean> {
  const session = await ensureYunleCloudbaseSession({ mode: 'interactive' })
  return !!session
}

async function submitCounter(api: typeof import('~/services/giveMeMoneyApi'), counterName: CounterName): Promise<boolean> {
  const result = await api.submitCounterVote(counterName)
  counter[counterName] = result.value
  setCounterErrors()
  showToast({
    message: t('message.counter-recorded'),
    type: 'success',
  })
  return true
}

function handleCounterError(api: typeof import('~/services/giveMeMoneyApi'), error: unknown): boolean {
  if (error instanceof api.CounterLoginRequiredError) {
    showToast({
      message: t('message.login-required-toast'),
      type: 'warning',
    })
    redirectToYunleLogin()
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

async function recordCounter(counterName: CounterName): Promise<boolean> {
  if (submittingCounter.value)
    return false

  submittingCounter.value = counterName
  try {
    const api = await import('~/services/giveMeMoneyApi')
    return await submitCounter(api, counterName)
  }
  catch (error) {
    const api = await import('~/services/giveMeMoneyApi')
    if (error instanceof api.CounterLoginRequiredError) {
      const loggedIn = await promptYunleLogin()
      if (!loggedIn)
        return handleCounterError(api, error)

      try {
        return await submitCounter(api, counterName)
      }
      catch (retryError) {
        return handleCounterError(api, retryError)
      }
    }

    return handleCounterError(api, error)
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
    <header class="gmm-pay-heading">
      <div class="gmm-pay-meta">
        <span>{{ t(`message.${payInfo.type}.name`) }}</span>
        <span>REQUEST · 001</span>
      </div>
      <h2 class="gmm-pay-title">
        {{
          t("message.give-me-pay", {
            name: t(`message.${payInfo.type}.name`),
          })
        }}
      </h2>
      <div class="gmm-payment-switch gmm-action-row">
        <BaseTooltip
          v-if="payInfo.type === 'alipay'"
          :content="t('prompt.wechat')"
        >
          <BaseButton
            class="gmm-payment-switch-button gmm-payment-switch-button--wechat"
            size="small"
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
            class="gmm-payment-switch-button gmm-payment-switch-button--alipay"
            size="small"
            @click="useForm('alipay')"
          >
            <template #icon>
              <i-ri-alipay-line />
            </template>
            {{ t("message.alipay.button") }}
          </BaseButton>
        </BaseTooltip>
      </div>
    </header>

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
  position: relative;
  width: 100%;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  color: var(--gmm-text);
  border: 1px solid var(--gmm-form-border);
  border-radius: 0.35rem;
  background: var(--gmm-form-background);
  box-shadow: var(--gmm-shadow-strong);
}

.gmm-form-shell::before,
.gmm-form-shell::after {
  position: absolute;
  left: 0;
  width: 100%;
  height: 0.55rem;
  pointer-events: none;
  content: '';
  background: radial-gradient(circle at 0.55rem 0, transparent 0.35rem, var(--gmm-panel-solid) 0.37rem) 0 0 / 1.1rem
    0.55rem repeat-x;
}

.gmm-form-shell::before {
  top: -0.3rem;
}

.gmm-form-shell::after {
  bottom: -0.3rem;
  transform: rotate(180deg);
}

.gmm-pay-heading {
  display: grid;
  gap: 0.8rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  text-align: left;
  border-bottom: 1px dashed var(--gmm-border-strong);
}

.gmm-pay-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--gmm-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gmm-pay-title {
  margin: 0;
  color: var(--gmm-heading);
  font-family: ui-rounded, 'Arial Rounded MT Bold', 'Hiragino Maru Gothic ProN', sans-serif;
  font-size: clamp(1.35rem, 3vw, 1.8rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.gmm-pay-form {
  display: grid;
  gap: 0.9rem;
  text-align: left;
}

.gmm-field {
  display: grid;
  gap: 0.35rem;
}

.gmm-field-label {
  color: var(--gmm-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.025em;
}

.gmm-field-error {
  color: var(--gmm-danger);
  font-size: 0.82rem;
  line-height: 1.35;
}

.gmm-check-row {
  padding: 0.75rem 0;
  border-top: 1px dashed var(--gmm-border);
  border-bottom: 1px dashed var(--gmm-border);
}

.gmm-action-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.65rem;
}

.gmm-payment-switch {
  display: contents;
}

.gmm-action-tooltip--ok {
  flex: 0 1 12rem;
}

.gmm-action-tooltip--reject {
  flex: 0 1 auto;
}

.gmm-action-button--ok {
  width: 100%;
  min-height: 3.15rem;
  padding: 0.7rem 1.35rem;
  font-size: 1.0625rem;
  font-weight: 700;
  border-color: var(--gmm-primary);
  background: var(--gmm-primary) !important;
  color: #fff !important;
}

.gmm-action-button--reject {
  min-width: 6rem;
  min-height: 3.15rem;
}

.gmm-payment-switch-button.gmm-payment-switch-button.gmm-payment-switch-button {
  width: fit-content;
  color: var(--gmm-payment-color);
  font-weight: 700;
  border-color: var(--gmm-payment-border);
  background: linear-gradient(180deg, var(--gmm-payment-bg-start), var(--gmm-payment-bg-end));
  box-shadow: none;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.gmm-payment-switch-button--wechat {
  --gmm-payment-color: #07c160;
  --gmm-payment-border: rgba(7, 193, 96, 0.48);
  --gmm-payment-bg-start: rgba(7, 193, 96, 0.12);
  --gmm-payment-bg-end: var(--gmm-panel-solid);
  --gmm-payment-hover-start: #07c160;
  --gmm-payment-hover-end: #06ad56;
  --gmm-payment-shadow: rgba(7, 193, 96, 0.14);
  --gmm-payment-shadow-strong: rgba(7, 193, 96, 0.25);
}

.gmm-payment-switch-button--alipay {
  --gmm-payment-color: #1677ff;
  --gmm-payment-border: rgba(22, 119, 255, 0.5);
  --gmm-payment-bg-start: rgba(22, 119, 255, 0.12);
  --gmm-payment-bg-end: var(--gmm-panel-solid);
  --gmm-payment-hover-start: #1677ff;
  --gmm-payment-hover-end: #0f63d8;
  --gmm-payment-shadow: rgba(22, 119, 255, 0.14);
  --gmm-payment-shadow-strong: rgba(22, 119, 255, 0.26);
}

.gmm-payment-switch-button.gmm-payment-switch-button.gmm-payment-switch-button:hover:not(:disabled),
.gmm-payment-switch-button.gmm-payment-switch-button.gmm-payment-switch-button:focus-visible {
  color: #fff;
  border-color: var(--gmm-payment-color);
  background: linear-gradient(180deg, var(--gmm-payment-hover-start), var(--gmm-payment-hover-end));
  box-shadow: 0 10px 22px var(--gmm-payment-shadow-strong);
  outline: none;
  transform: translateY(-1px);
}

:global(html.dark .gmm-payment-switch-button.gmm-payment-switch-button.gmm-payment-switch-button) {
  color: var(--gmm-payment-color);
  border-color: var(--gmm-payment-border);
  background: linear-gradient(180deg, var(--gmm-payment-bg-start), rgba(13, 21, 16, 0.92));
  box-shadow: 0 0 18px var(--gmm-payment-shadow);
  text-shadow: 0 0 12px var(--gmm-payment-shadow-strong);
}

:global(html.dark .gmm-payment-switch-button.gmm-payment-switch-button.gmm-payment-switch-button:hover:not(:disabled)),
:global(html.dark .gmm-payment-switch-button.gmm-payment-switch-button.gmm-payment-switch-button:focus-visible) {
  color: #fff;
  border-color: var(--gmm-payment-color);
  background: linear-gradient(180deg, var(--gmm-payment-hover-start), var(--gmm-payment-hover-end));
  box-shadow: 0 0 24px var(--gmm-payment-shadow-strong);
}

@media (max-width: 720px) {
  .gmm-action-row {
    grid-template-columns: 1fr;

    :deep(.base-tooltip),
    :deep(.base-button) {
      width: 100%;
    }
  }
}

@media (max-width: 360px) {
  .gmm-pay-title {
    font-size: 1.32rem;
  }
}
</style>
