import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { redirectToExternalUrl } from '~/utils/externalNavigation'
import Brothers from './brothers.vue'

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}))

vi.mock('~/services/commentsConfig', () => ({
  getCommentsUrl: () => 'https://apps.yunle.fun/app/give-me-money',
}))

vi.mock('~/utils/externalNavigation', () => ({
  redirectToExternalUrl: vi.fn(),
}))

const messages = {
  'zh-CN': {
    message: {
      'open-comments': '去应用评论页',
      'redirecting-comments': '正在跳转到应用评论页……',
    },
  },
}

function mountBrothersPage() {
  const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages,
  })

  return mount(Brothers, {
    global: {
      plugins: [i18n],
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('brothers page', () => {
  it('renders a fallback comments link and redirects on mount', () => {
    const wrapper = mountBrothersPage()

    expect(wrapper.text()).toContain('正在跳转到应用评论页')
    expect(wrapper.get('a').attributes('href')).toBe('https://apps.yunle.fun/app/give-me-money')
    expect(redirectToExternalUrl).toHaveBeenCalledWith('https://apps.yunle.fun/app/give-me-money')
  })
})
