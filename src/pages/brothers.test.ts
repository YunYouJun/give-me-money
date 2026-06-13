import type { PayRecordPage } from '~/services/giveMeMoneyApi'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { clearToasts, useToast } from '~/composables/useToast'
import { listPayRecords } from '~/services/giveMeMoneyApi'
import Brothers from './brothers.vue'

vi.mock('~/services/giveMeMoneyApi', () => ({
  listPayRecords: vi.fn(),
}))

const messages = {
  'zh-CN': {
    message: {
      'empty-records': '暂时还没有好心哥哥。',
      'loading': '加载中……',
      'refresh': '刷新',
    },
    title: {
      'good-brothers': ' 位好心的哥哥们~',
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
      stubs: {
        BrotherList: {
          props: ['tableData'],
          template: '<div data-testid="brother-list">{{ tableData.length }}</div>',
        },
        BaseButton: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
        },
        BrotherPagination: {
          props: ['total'],
          template: '<nav data-testid="pagination">pagination {{ total }}</nav>',
        },
        IRiRefreshLine: true,
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  clearToasts()
})

describe('brothers page', () => {
  it('shows loading then empty state', async () => {
    let resolveList!: (value: PayRecordPage) => void
    vi.mocked(listPayRecords).mockReturnValue(new Promise(resolve => resolveList = resolve))

    const wrapper = mountBrothersPage()
    await nextTick()
    expect(wrapper.text()).toContain('加载中……')

    resolveList({ items: [], total: 0 })
    await flushPromises()

    expect(wrapper.text()).toContain('暂时还没有好心哥哥。')
  })

  it('renders total, records and pagination for non-empty pages', async () => {
    vi.mocked(listPayRecords).mockResolvedValue({
      items: [
        {
          accountMasked: 'a***e@example.com',
          appId: 'give-me-money',
          authorId: 'uid-1',
          authorName: 'Alice',
          createdAt: 1700000000000,
          id: 'r1',
          name: 'Alice',
          password: 'secret123',
          pin: '123456',
          type: 'alipay',
        },
      ],
      total: 21,
    })

    const wrapper = mountBrothersPage()
    await flushPromises()

    expect(wrapper.text()).toContain('21 位好心的哥哥们~')
    expect(wrapper.get('[data-testid="brother-list"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="pagination"]').text()).toContain('21')
  })

  it('shows error state and reports failed page loads', async () => {
    vi.mocked(listPayRecords).mockRejectedValue(new Error('database unavailable'))

    const wrapper = mountBrothersPage()
    await flushPromises()

    expect(wrapper.text()).toContain('database unavailable')
    expect(useToast().toasts.value).toEqual([expect.objectContaining({
      message: 'database unavailable',
      type: 'warning',
    })])
  })
})
