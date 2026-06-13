import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { loadLanguageAsync } from '~/modules/i18n'
import { useAppStore } from '~/stores/app'
import LangSelect from './LangSelect.vue'

vi.mock('~/modules/i18n', () => ({
  availableLocales: ['zh-CN', 'en', 'ja'],
  loadLanguageAsync: vi.fn(async lang => lang),
}))

const messages = {
  'zh-CN': {
    button: {
      toggle_langs: '切换语言',
    },
  },
  'en': {
    button: {
      toggle_langs: 'Change languages',
    },
  },
  'ja': {
    button: {
      toggle_langs: '言語を切り替え',
    },
  },
}

function mountLangSelect(initialLocale = 'zh-CN') {
  const pinia = createPinia()
  setActivePinia(pinia)

  const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    messages,
  })

  return mount(LangSelect, {
    global: {
      plugins: [pinia, i18n],
      stubs: {
        IMdiTranslate: true,
        IRiArrowDownSLine: true,
        IRiCheckLine: true,
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('lang select', () => {
  it('opens an explicit language menu', async () => {
    const wrapper = mountLangSelect()
    const trigger = wrapper.get('.lang-select-trigger')

    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('click')

    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[role="menuitemradio"]').map(item => item.text())).toEqual([
      '中文',
      'English',
      '日本語',
    ])
    expect(wrapper.get('[aria-checked="true"]').text()).toContain('中文')
  })

  it('selects Japanese and closes the menu', async () => {
    const wrapper = mountLangSelect()

    await wrapper.get('.lang-select-trigger').trigger('click')
    const japaneseOption = wrapper.findAll('[role="menuitemradio"]')
      .find(option => option.text().includes('日本語'))

    expect(japaneseOption).toBeTruthy()
    await japaneseOption!.trigger('click')
    await flushPromises()

    expect(loadLanguageAsync).toHaveBeenCalledWith('ja')
    expect(useAppStore().language).toBe('ja')
    expect(localStorage.getItem('lang')).toBe('ja')
    expect(wrapper.get('.lang-select-trigger').attributes('aria-expanded')).toBe('false')
  })

  it('closes the menu with Escape', async () => {
    const wrapper = mountLangSelect()

    await wrapper.get('.lang-select-trigger').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.get('.lang-select-trigger').attributes('aria-expanded')).toBe('false')
  })
})
