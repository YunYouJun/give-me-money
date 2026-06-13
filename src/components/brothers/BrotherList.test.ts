import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import BrotherList from './BrotherList.vue'

const messages = {
  en: {
    message: {
      'alipay': { name: 'Alipay' },
      'brother': { anonymous: 'Anonymous', name: 'Name' },
      'pay': {
        account: 'Account',
        all: 'All',
        author: 'Author',
        password: 'Password',
        pin: 'PIN',
        time: 'Time',
        type: 'Type',
      },
      'empty-records': 'No records yet.',
      'wechat': { name: 'WeChat' },
    },
  },
}

describe('brother list', () => {
  it('renders records in a native table', () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages })
    const wrapper = mount(BrotherList, {
      global: { plugins: [i18n] },
      props: {
        formatTime: () => '2023-11-14 22:13:20',
        tableData: [
          {
            accountMasked: 'a***e@example.com',
            appId: 'give-me-money',
            authorId: 'uid-1',
            authorName: 'Alice',
            createdAt: 1700000000000,
            id: 'r1',
            name: '',
            password: 'secret123',
            pin: '123456',
            type: 'alipay',
          },
        ],
      },
    })

    expect(wrapper.get('table').text()).toContain('Anonymous')
    expect(wrapper.get('table').text()).toContain('a***e@example.com')
    expect(wrapper.get('table').text()).toContain('2023-11-14 22:13:20')
  })
})
