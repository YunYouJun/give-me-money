import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseTooltip from '~/components/ui/BaseTooltip.vue'
import Navbar from './Navbar.vue'

const routeMock = vi.hoisted(() => ({
  path: '/',
}))

const authMock = vi.hoisted(() => ({
  checkSession: vi.fn(),
  config: { appId: 'give-me-money' },
  error: { value: null as string | null },
  hasChecked: { value: false },
  isAuthenticated: { value: false },
  isConfigured: { value: true },
  loading: { value: false },
  loginWithYunle: vi.fn(),
  logout: vi.fn(),
  user: { value: null as { nickname: string } | null },
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('~/composables/useYunleAuth', () => ({
  useYunleAuth: () => authMock,
}))

const messages = {
  'zh-CN': {
    link: {
      about: '关于',
      brothers: '哥哥们~',
    },
    message: {
      'cloudbase-not-configured': '当前未配置 CloudBase 访问密钥，页面可浏览但暂时不能提交。',
      'login-yunle': '登录云乐坊账号',
      'logout': '退出登录',
      'yunle-account': '云乐坊账号',
      'yunle-connected': '已登录：{name}',
      'yunle-login-required': '登录云乐坊账号后才可以提交或拒绝。',
    },
  },
}

function resetAuthMock() {
  routeMock.path = '/'
  authMock.checkSession.mockResolvedValue(null)
  authMock.error.value = null
  authMock.hasChecked.value = false
  authMock.isAuthenticated.value = false
  authMock.isConfigured.value = true
  authMock.loading.value = false
  authMock.loginWithYunle.mockResolvedValue(null)
  authMock.logout.mockResolvedValue(undefined)
  authMock.user.value = null
}

function mountNavbar() {
  const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages,
  })

  return mount(Navbar, {
    global: {
      components: {
        BaseButton,
        BaseTooltip,
      },
      plugins: [i18n],
      stubs: {
        IMdiGithub: true,
        IRiLoginBoxLine: true,
        IRiUserSmileLine: true,
        LangSelect: {
          template: '<div class="lang-select-stub" />',
        },
        RouterLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
        },
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  resetAuthMock()
})

describe('navbar', () => {
  it('shows YunLeFun login in the top right and starts session check', async () => {
    const wrapper = mountNavbar()
    await flushPromises()

    expect(authMock.checkSession).toHaveBeenCalledOnce()
    expect(wrapper.get('.gmm-nav-auth').text()).toContain('登录云乐坊账号')

    await wrapper.get('.gmm-nav-auth').trigger('click')

    expect(authMock.loginWithYunle).toHaveBeenCalledOnce()
  })

  it('shows signed-in user and logs out from the top-right account button', async () => {
    authMock.hasChecked.value = true
    authMock.isAuthenticated.value = true
    authMock.user.value = { nickname: 'Alice' }

    const wrapper = mountNavbar()
    await flushPromises()

    expect(authMock.checkSession).not.toHaveBeenCalled()
    expect(wrapper.get('.gmm-nav-auth').text()).toContain('Alice')

    await wrapper.get('.gmm-nav-auth').trigger('click')

    expect(authMock.logout).toHaveBeenCalledOnce()
  })
})
