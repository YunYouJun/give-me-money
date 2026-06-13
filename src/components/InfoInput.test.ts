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

const authMock = vi.hoisted(() => ({
  checkSession: vi.fn(),
  config: { appId: 'give-me-money' },
  error: { value: null as string | null },
  hasChecked: { value: false },
  isAuthenticated: { value: false },
  isConfigured: { value: false },
  loading: { value: false },
  loginWithYunle: vi.fn(),
  logout: vi.fn(),
  user: { value: null as { nickname: string } | null },
}))

const apiMocks = vi.hoisted(() => ({
  createPayRecord: vi.fn(),
  getPayRecordCount: vi.fn(),
  incrementNoCounter: vi.fn(),
  readNoCounter: vi.fn(),
}))

vi.mock('~/composables/useYunleAuth', () => ({
  useYunleAuth: () => authMock,
}))

vi.mock('~/services/giveMeMoneyApi', () => apiMocks)

vi.mock('../utils', () => ({
  playLoveAudio: vi.fn(),
}))

const messages = {
  'zh-CN': {
    message: {
      'alipay': {
        button: '其实我用支付宝啦~',
        name: '支付宝',
      },
      'be-serious': '(σ‘・д・)σ 给我认真填啦!',
      'check': '我确认公开展示填写内容。',
      'cloudbase-not-configured': '当前未配置 CloudBase 访问密钥，页面可浏览但暂时不能提交。',
      'give-me-pay': '欧尼酱，可以……告诉我……你的……{name}吗？',
      'loading': '加载中……',
      'login-yunle': '登录云乐坊账号',
      'logout': '退出登录',
      'must-acknowledge': '请先确认这是恶作剧网站，并同意公开展示填写内容。',
      'name': '你的名字',
      'name-placeholder': '人家也不是一定要知道你的名字啦～',
      'no': '残忍拒绝',
      'ok': '好的，给你!',
      'pay': {
        'account': '账号',
        'account-placeholder': '提交前会自动脱敏，只公开部分字符',
        'password': '密码',
        'pin': '交易密码',
      },
      'wechat': {
        button: '其实我用微信啦~',
        name: '微信',
      },
      'yunle-account': '云乐坊账号',
      'yunle-connected': '已登录：{name}',
      'yunle-login-required': '登录云乐坊账号后才可以提交或拒绝。',
    },
    prompt: {
      alipay: '那还是填支付宝吧~',
      no: '已被残忍拒绝 {value} 次！',
      ok: '已经有 {value} 个欧尼酱告诉我啦！',
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

function resetAuthMock() {
  authMock.checkSession.mockResolvedValue(null)
  authMock.error.value = null
  authMock.hasChecked.value = false
  authMock.isAuthenticated.value = false
  authMock.isConfigured.value = false
  authMock.loading.value = false
  authMock.loginWithYunle.mockResolvedValue(null)
  authMock.user.value = null
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
        IRiLoginBoxLine: true,
        IRiLogoutBoxRLine: true,
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
  resetAuthMock()
  clearToasts()
  apiMocks.getPayRecordCount.mockResolvedValue(2)
  apiMocks.readNoCounter.mockResolvedValue(1)
})

describe('info input', () => {
  it('requires acknowledgement before submitting', async () => {
    authMock.isConfigured.value = true
    authMock.isAuthenticated.value = true

    const wrapper = mountInfoInput()
    await flushPromises()

    await findActionButton(wrapper, '好的，给你!').trigger('click')

    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '请先确认这是恶作剧网站，并同意公开展示填写内容。',
      type: 'error',
    })])
    expect(apiMocks.createPayRecord).not.toHaveBeenCalled()
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

  it('validates pin input before creating a pay record', async () => {
    authMock.isConfigured.value = true
    authMock.isAuthenticated.value = true

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
    expect(apiMocks.createPayRecord).not.toHaveBeenCalled()
  })

  it('warns when submitting without CloudBase configuration', async () => {
    const wrapper = mountInfoInput()
    await flushPromises()

    await wrapper.get('input[type="checkbox"]').setValue(true)
    await findActionButton(wrapper, '好的，给你!').trigger('click')

    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: '当前未配置 CloudBase 访问密钥，页面可浏览但暂时不能提交。',
      type: 'warning',
    })])
    expect(authMock.loginWithYunle).not.toHaveBeenCalled()
  })

  it('keeps pay record counter tooltip separate from no counter failures', async () => {
    authMock.isConfigured.value = true
    apiMocks.getPayRecordCount.mockResolvedValue(7)
    apiMocks.readNoCounter.mockRejectedValue(new Error('Db or Table not exist: counters. Please check your request.'))

    const wrapper = mountInfoInput()
    await flushPromises()

    const tooltips = wrapper.findAll('.gmm-action-row .base-tooltip-content')

    expect(tooltips[0]?.text()).toBe('已经有 7 个欧尼酱告诉我啦！')
    expect(tooltips[1]?.text()).toContain('Db or Table not exist: counters')
  })
})
