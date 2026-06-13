import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { clearToasts, useToast } from '~/composables/useToast'
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

vi.mock('~/services/giveMeMoneyApi', () => apiMocks)

vi.mock('~/services/cloudbaseConfig', () => cloudbaseConfigMock)

vi.mock('~/services/commentsConfig', () => ({
  getCommentsUrl: () => 'https://apps.yunle.fun/app/give-me-money',
}))

vi.mock('../utils', () => ({
  playLoveAudio: vi.fn(),
}))

const messages = {
  'zh-CN': {
    button: {
      close: '关闭',
    },
    message: {
      'alipay': {
        button: '其实我用支付宝啦~',
        name: '支付宝',
      },
      'be-serious': '(σ‘・д・)σ 给我认真填啦!',
      'check': '我确认这是恶作剧，只在本页使用。',
      'counter-unavailable': '历史计数暂不可用。',
      'counter-recorded': '已记录到公共计数器。',
      'counter-record-failed': '计数失败：{reason}',
      'login-required-title': '需要先登录',
      'login-required-description': '请先登录云乐坊，登录后再回来提交一次计数。账号、密码和交易密码仍然不会保存。',
      'login-required-action': '登录云乐坊',
      'login-required-toast': '请先登录云乐坊后再提交。',
      'already-submitted-title': '已经提交过啦',
      'already-submitted-description': '每个登录用户只能提交一次，当前不会重复写入公共计数器。',
      'already-submitted-toast': '你已经提交过一次啦。',
      'fake-reject-description': '已记录一次拒绝，但不会保存账号、密码或交易密码。',
      'fake-reject-title': '已拒绝',
      'fake-submit-description': '这只是恶作剧，没有提交或保存任何账号、密码、交易密码。此次参与已记录到公共计数器。',
      'fake-submit-title': '没有真的提交',
      'give-me-pay': '欧尼酱，可以……告诉我……你的……{name}吗？',
      'loading': '加载中……',
      'must-acknowledge': '请先确认这是恶作剧网站，且填写内容只会在本页用于玩笑效果。',
      'name': '你的名字',
      'name-placeholder': '人家也不是一定要知道你的名字啦～',
      'no': '残忍拒绝',
      'ok': '好的，给你!',
      'open-comments': '去应用评论页',
      'open-comments-login': '登录云乐坊并评论',
      'pay': {
        'account': '账号',
        'account-placeholder': '只在本页用于玩笑效果，不会提交保存',
        'password': '密码',
        'pin': '交易密码',
      },
      'wechat': {
        button: '其实我用微信啦~',
        name: '微信',
      },
    },
    prompt: {
      alipay: '那还是填支付宝吧~',
      no: '已被残忍拒绝 {value} 次！',
      ok: '已经有 {value} 个欧尼酱参与过啦！',
      pay: {
        account: '请给我账号~',
        password: '还有密码~',
        pin: '以及交易密码~',
      },
      wechat: '那填微信也行哦~',
    },
    error: {
      validator: {
        'account': '账号至少需要 2 个字符。',
        'password': '密码至少需要 6 个字符。',
        'pin': '我记得交易密码是纯数字吧！',
        'pin-length': '交易密码需要 6 位数字。',
      },
    },
  },
}

function mountInfoInput() {
  const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages,
  })

  return mount(InfoInput, {
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
  const button = wrapper.findAll('.gmm-action-row button').find(item => item.text().includes(text))
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

  it('prompts the user to sign in before writing the public counter', async () => {
    apiMocks.submitCounterVote.mockRejectedValueOnce(new apiMocks.CounterLoginRequiredError())

    const wrapper = mountInfoInput()
    await flushPromises()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('#pay-account').setValue('alice')
    await wrapper.get('#pay-password').setValue('secret1')
    await wrapper.get('#pay-pin').setValue('123456')
    await findActionButton(wrapper, '好的，给你!').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').text()).toContain('需要先登录')
    expect(wrapper.get('[role="dialog"]').text()).toContain('登录云乐坊')
    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '请先登录云乐坊后再提交。',
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

    const tooltips = wrapper.findAll('.gmm-action-row .base-tooltip-content')

    expect(tooltips[0]?.text()).toBe('已经有 7 个欧尼酱参与过啦！')
    expect(tooltips[1]?.text()).toBe('历史计数暂不可用。')
  })
})
