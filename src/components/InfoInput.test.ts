import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { TooltipProvider } from 'reka-ui'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createI18n } from 'vue-i18n'
import { clearToasts, useToast } from '~/composables/useToast'
import zhCNMessages from '../../locales/zh-CN.yml'
import InfoInput from './InfoInput.vue'
import BaseButton from './ui/BaseButton.vue'
import BaseCheckbox from './ui/BaseCheckbox.vue'
import BaseInput from './ui/BaseInput.vue'
import BaseTooltip from './ui/BaseTooltip.vue'

const apiMocks = vi.hoisted(() => ({
  CounterAlreadySubmittedError: class CounterAlreadySubmittedError extends Error {},
  CounterLoginRequiredError: class CounterLoginRequiredError extends Error {},
  getApiErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof Error)
      return error.message
    return '请求失败，请稍后重试。'
  }),
  readNoCounter: vi.fn(),
  readOkCounter: vi.fn(),
  submitCounterVote: vi.fn(),
}))

const cloudbaseConfigMock = vi.hoisted(() => ({
  isCloudbaseReady: vi.fn(),
}))

const yunleSsoMocks = vi.hoisted(() => ({
  ensureYunleCloudbaseSession: vi.fn(),
  redirectToYunleLogin: vi.fn(),
}))

vi.mock('~/services/giveMeMoneyApi', () => apiMocks)

vi.mock('~/services/cloudbaseConfig', () => cloudbaseConfigMock)

vi.mock('~/services/yunleSso', () => yunleSsoMocks)

vi.mock('~/services/commentsConfig', () => ({
  getCommentsUrl: () => 'https://apps.yunle.fun/app/give-me-money',
}))

vi.mock('../utils', () => ({
  playLoveAudio: vi.fn(),
}))

const messages = { 'zh-CN': zhCNMessages }

const InfoInputTestHost = defineComponent({
  name: 'InfoInputTestHost',
  setup() {
    return () => h(TooltipProvider, null, {
      default: () => h(InfoInput),
    })
  },
})

function mountInfoInput() {
  const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages,
  })

  return mount(InfoInputTestHost, {
    global: {
      components: {
        BaseButton,
        BaseCheckbox,
        BaseInput,
        BaseTooltip,
      },
      plugins: [createPinia(), i18n],
      stubs: {
        BasePinInput: {
          emits: ['update:modelValue'],
          props: ['id', 'modelValue', 'disabled', 'invalid'],
          template: '<input :id="id" data-testid="pay-pin" :value="modelValue" :disabled="disabled" :aria-invalid="invalid ? \'true\' : undefined" @input="$emit(\'update:modelValue\', $event.target.value)">',
        },
        IRiAlipayLine: true,
        IRiCloseCircleLine: true,
        IRiHandHeartLine: true,
        IRiWechatPayLine: true,
      },
    },
  })
}

function findActionButton(wrapper: ReturnType<typeof mountInfoInput>, text: string) {
  const button = wrapper.findAll('button').find(item => item.text().includes(text))
  expect(button).toBeTruthy()
  return button!
}

beforeEach(() => {
  vi.clearAllMocks()
  clearToasts()
  cloudbaseConfigMock.isCloudbaseReady.mockReturnValue(true)
  apiMocks.readOkCounter.mockResolvedValue(2)
  apiMocks.readNoCounter.mockResolvedValue(1)
  apiMocks.submitCounterVote.mockImplementation(async (counterName: 'no' | 'ok') => ({
    counterName,
    value: counterName === 'ok' ? 3 : 2,
  }))
  yunleSsoMocks.ensureYunleCloudbaseSession.mockResolvedValue(null)
})

describe('info input', () => {
  it('requires acknowledgement before showing the fake submit dialog', async () => {
    const wrapper = mountInfoInput()
    await flushPromises()

    await findActionButton(wrapper, '好的，给你!').trigger('click')

    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '请先确认这是恶作剧网站，且填写内容只会在本页用于玩笑效果。',
      type: 'error',
    })])
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('switches between Alipay and WeChat form labels', async () => {
    const wrapper = mountInfoInput()
    await flushPromises()

    expect(wrapper.text()).toContain('你的……支付宝吗？')
    expect(wrapper.text()).toContain('支付宝账号')

    await findActionButton(wrapper, '其实我用微信啦~').trigger('click')

    expect(wrapper.text()).toContain('你的……微信吗？')
    expect(wrapper.text()).toContain('微信账号')
  })

  it('uses brand classes on payment switch buttons', async () => {
    const wrapper = mountInfoInput()
    await flushPromises()

    const wechatButton = findActionButton(wrapper, '其实我用微信啦~')
    expect(wechatButton.classes()).toContain('gmm-payment-switch-button')
    expect(wechatButton.classes()).toContain('gmm-payment-switch-button--wechat')

    await wechatButton.trigger('click')

    const alipayButton = findActionButton(wrapper, '其实我用支付宝啦~')
    expect(alipayButton.classes()).toContain('gmm-payment-switch-button')
    expect(alipayButton.classes()).toContain('gmm-payment-switch-button--alipay')
  })

  it('validates pin input before showing the fake submit dialog', async () => {
    const wrapper = mountInfoInput()
    await flushPromises()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('#pay-account').setValue('alice')
    await wrapper.get('#pay-password').setValue('secret1')
    await wrapper.get('#pay-pin').setValue('abc123')
    await findActionButton(wrapper, '好的，给你!').trigger('click')

    expect(wrapper.text()).toContain('我记得交易密码是纯数字吧！')
    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '(σ‘・д・)σ 给我认真填啦!',
      type: 'warning',
    })])
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('records a valid fake submit once and keeps sensitive fields out of the dialog', async () => {
    const wrapper = mountInfoInput()
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('#pay-account').setValue('alice')
    await wrapper.get('#pay-password').setValue('secret1')
    await wrapper.get('#pay-pin').setValue('123456')
    await findActionButton(wrapper, '好的，给你!').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('没有真的提交')
    expect(wrapper.get('[role="dialog"]').text()).toContain('没有提交或保存任何账号、密码、交易密码')
    expect(wrapper.get('[role="dialog"]').text()).toContain('登录云乐坊并评论')
    expect(wrapper.get('.submission-dialog-action.is-primary').attributes('href')).toBe('https://apps.yunle.fun/app/give-me-money')
    expect(apiMocks.submitCounterVote).toHaveBeenCalledWith('ok')
    expect(apiMocks.readOkCounter).not.toHaveBeenCalled()
    expect(apiMocks.readNoCounter).not.toHaveBeenCalled()
  })

  it('records a rejection counter once', async () => {
    const wrapper = mountInfoInput()
    await flushPromises()
    vi.clearAllMocks()

    await findActionButton(wrapper, '残忍拒绝').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('已拒绝')
    expect(wrapper.get('[role="dialog"]').text()).toContain('已记录一次拒绝')
    expect(apiMocks.submitCounterVote).toHaveBeenCalledWith('no')
    expect(apiMocks.readOkCounter).not.toHaveBeenCalled()
    expect(apiMocks.readNoCounter).not.toHaveBeenCalled()
  })

  it('syncs YunLe sign-in and retries before writing the public counter', async () => {
    apiMocks.submitCounterVote.mockRejectedValueOnce(new apiMocks.CounterLoginRequiredError())
    yunleSsoMocks.ensureYunleCloudbaseSession.mockImplementation(async (options?: { mode?: string }) => {
      if (options?.mode === 'interactive')
        return { session: {}, userId: 'user-1' }

      return null
    })

    const wrapper = mountInfoInput()
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('#pay-account').setValue('alice')
    await wrapper.get('#pay-password').setValue('secret1')
    await wrapper.get('#pay-pin').setValue('123456')
    await findActionButton(wrapper, '好的，给你!').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('没有真的提交')
    expect(apiMocks.submitCounterVote).toHaveBeenCalledTimes(2)
    expect(yunleSsoMocks.ensureYunleCloudbaseSession).toHaveBeenCalledWith({ mode: 'interactive' })
    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '已记录到公共计数器。',
      type: 'success',
    })])
  })

  it('redirects the user to YunLe sign-in when SSO has no session', async () => {
    apiMocks.submitCounterVote.mockRejectedValueOnce(new apiMocks.CounterLoginRequiredError())
    yunleSsoMocks.ensureYunleCloudbaseSession.mockResolvedValue(null)

    const wrapper = mountInfoInput()
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('#pay-account').setValue('alice')
    await wrapper.get('#pay-password').setValue('secret1')
    await wrapper.get('#pay-pin').setValue('123456')
    await findActionButton(wrapper, '好的，给你!').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(apiMocks.submitCounterVote).toHaveBeenCalledTimes(1)
    expect(yunleSsoMocks.ensureYunleCloudbaseSession).toHaveBeenCalledWith({ mode: 'interactive' })
    expect(yunleSsoMocks.redirectToYunleLogin).toHaveBeenCalledTimes(1)
    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '请先登录云乐坊，登录成功后再回来提交。',
      type: 'warning',
    })])
  })

  it('redirects to YunLe sign-in when the synced session still cannot submit', async () => {
    apiMocks.submitCounterVote.mockRejectedValue(new apiMocks.CounterLoginRequiredError())
    yunleSsoMocks.ensureYunleCloudbaseSession.mockImplementation(async (options?: { mode?: string }) => {
      if (options?.mode === 'interactive')
        return { session: {}, userId: 'user-1' }

      return null
    })

    const wrapper = mountInfoInput()
    await flushPromises()
    vi.clearAllMocks()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('#pay-account').setValue('alice')
    await wrapper.get('#pay-password').setValue('secret1')
    await wrapper.get('#pay-pin').setValue('123456')
    await findActionButton(wrapper, '好的，给你!').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(apiMocks.submitCounterVote).toHaveBeenCalledTimes(2)
    expect(yunleSsoMocks.redirectToYunleLogin).toHaveBeenCalledTimes(1)
    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '请先登录云乐坊，登录成功后再回来提交。',
      type: 'warning',
    })])
  })

  it('does not write the public counter twice for the same user', async () => {
    apiMocks.submitCounterVote.mockRejectedValueOnce(new apiMocks.CounterAlreadySubmittedError())

    const wrapper = mountInfoInput()
    await flushPromises()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('#pay-account').setValue('alice')
    await wrapper.get('#pay-password').setValue('secret1')
    await wrapper.get('#pay-pin').setValue('123456')
    await findActionButton(wrapper, '好的，给你!').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('已经提交过啦')
    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '你已经提交过一次啦。',
      type: 'warning',
    })])
  })

  it('keeps ok counter tooltip separate from no counter failures', async () => {
    apiMocks.readOkCounter.mockResolvedValue(7)
    apiMocks.readNoCounter.mockRejectedValue(new Error('you can\'t request without auth'))

    const wrapper = mountInfoInput()
    await flushPromises()

    const tooltipContents = wrapper.findAllComponents(BaseTooltip)
      .map(tooltip => tooltip.props('content'))

    expect(tooltipContents).toContain('已经有 7 个欧尼酱参与过啦！')
    expect(tooltipContents).toContain('历史计数暂不可用。')
  })
})
