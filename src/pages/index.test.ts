import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import IndexPage from './index.vue'

const messages = {
  'zh-CN': {
    message: {
      header: '可爱的萝莉妹妹们',
      nsfw: {
        title: 'NSFW 内容提醒',
        description: '此页面包含恶作剧内容与可能在公共或工作场合不适合查看、播放的素材。',
        continue: '继续预览',
      },
    },
  },
}

function mountIndexPage() {
  const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages,
  })

  return mount(IndexPage, {
    global: {
      plugins: [i18n],
      stubs: {
        BaseButton: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\', $event)"><slot name="icon" /><slot /></button>',
        },
        DisplayImage: {
          template: '<div data-testid="display-image" />',
        },
        InfoInput: {
          template: '<div data-testid="info-input" />',
        },
        IRiErrorWarningLine: true,
        IRiEyeLine: true,
      },
    },
  })
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('index page', () => {
  it('requires acknowledgement before rendering prank content', async () => {
    const wrapper = mountIndexPage()

    expect(wrapper.text()).toContain('NSFW 内容提醒')
    expect(wrapper.find('[data-testid="display-image"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="info-input"]').exists()).toBe(false)

    await wrapper.get('button').trigger('click')

    expect(wrapper.text()).toContain('可爱的萝莉妹妹们')
    expect(wrapper.find('[data-testid="display-image"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="info-input"]').exists()).toBe(true)
    expect(sessionStorage.getItem('give-me-money:preview-warning-accepted')).toBe('true')
  })

  it('keeps content visible after acknowledgement in the same session', async () => {
    sessionStorage.setItem('give-me-money:preview-warning-accepted', 'true')

    const wrapper = mountIndexPage()
    await nextTick()

    expect(wrapper.text()).not.toContain('NSFW 内容提醒')
    expect(wrapper.find('[data-testid="display-image"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="info-input"]').exists()).toBe(true)
  })
})
