import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { redirectToExternalUrl } from '~/utils/externalNavigation'
import Brothers from './brothers.vue'

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}))

vi.mock('~/services/commentsConfig', () => ({
  getCommentsUrl: () => 'https://apps.yunle.fun/',
}))

vi.mock('~/utils/externalNavigation', () => ({
  redirectToExternalUrl: vi.fn(),
}))

const messages = {
  'zh-CN': {
    message: {
      'open-comments': '去评论应用',
      'redirecting-comments': '正在跳转到评论应用……',
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

    expect(wrapper.text()).toContain('正在跳转到评论应用')
    expect(wrapper.get('a').attributes('href')).toBe('https://apps.yunle.fun/')
    expect(redirectToExternalUrl).toHaveBeenCalledWith('https://apps.yunle.fun/')
  })
})
