import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    attachTo: document.body,
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

async function openLanguageSelect(wrapper: ReturnType<typeof mountLangSelect>) {
  const trigger = wrapper.get('.lang-select-trigger')
  await trigger.trigger('pointerdown', {
    button: 0,
    ctrlKey: false,
    pointerType: 'mouse',
  })
  await nextTick()
  return trigger
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

enableAutoUnmount(afterEach)

describe('lang select', () => {
  it('opens an explicit language menu', async () => {
    const wrapper = mountLangSelect()
    const trigger = wrapper.get('.lang-select-trigger')

    expect(trigger.attributes('aria-expanded')).toBe('false')

    await openLanguageSelect(wrapper)

    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(Array.from(document.querySelectorAll('[role="option"]')).map(item => item.textContent?.trim())).toEqual([
      '中文',
      'English',
      '日本語',
    ])
    expect(document.querySelector('[role="option"][data-state="checked"]')?.textContent).toContain('中文')
  })

  it('selects Japanese and closes the menu', async () => {
    const wrapper = mountLangSelect()

    await openLanguageSelect(wrapper)
    const japaneseOption = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
      .find(option => option.textContent?.includes('日本語'))

    expect(japaneseOption).toBeTruthy()
    japaneseOption!.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      button: 0,
      pointerType: 'mouse',
    }))
    await flushPromises()

    expect(loadLanguageAsync).toHaveBeenCalledWith('ja')
    expect(useAppStore().language).toBe('ja')
    expect(localStorage.getItem('lang')).toBe('ja')
    expect(wrapper.get('.lang-select-trigger').attributes('aria-expanded')).toBe('false')
  })

  it('closes the menu with Escape', async () => {
    const wrapper = mountLangSelect()

    await openLanguageSelect(wrapper)
    document.querySelector('[role="option"][data-state="checked"]')?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await nextTick()

    expect(wrapper.get('.lang-select-trigger').attributes('aria-expanded')).toBe('false')
  })
})
