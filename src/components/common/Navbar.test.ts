import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import BaseTooltip from '~/components/ui/BaseTooltip.vue'
import Navbar from './Navbar.vue'

const routeMock = vi.hoisted(() => ({
  path: '/',
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('~/services/commentsConfig', () => ({
  getCommentsUrl: () => 'https://apps.yunle.fun/app/give-me-money',
}))

const messages = {
  'zh-CN': {
    link: {
      about: '关于',
      comments: '评论',
    },
  },
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
        BaseTooltip,
      },
      plugins: [i18n],
      stubs: {
        IMdiGithub: true,
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
  routeMock.path = '/'
})

describe('navbar', () => {
  it('links to the app comments page instead of the removed brothers route', () => {
    const wrapper = mountNavbar()

    const links = wrapper.findAll('a')
    const commentsLink = links.find(link => link.text() === '评论')

    expect(commentsLink?.attributes('href')).toBe('https://apps.yunle.fun/app/give-me-money')
    expect(commentsLink?.attributes('target')).toBe('_blank')
    expect(links.some(link => link.attributes('href') === '/brothers')).toBe(false)
    expect(wrapper.find('.gmm-nav-auth').exists()).toBe(false)
  })
})
