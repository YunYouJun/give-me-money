import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { isDark } from '~/logic/dark'
import BaseFooter from './BaseFooter.vue'

vi.mock('~/logic/dark', async () => {
  const { shallowRef } = await import('vue')

  return {
    isDark: shallowRef(false),
  }
})

vi.mock('vue-about-me', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    VueAboutMe: defineComponent({
      name: 'VueAboutMe',
      props: {
        copyright: {
          type: Object,
          required: true,
        },
        isDark: {
          type: Boolean,
          required: true,
        },
      },
      setup(props) {
        return () => h('div', {
          'data-testid': 'vue-about-me',
          'data-is-dark': String(props.isDark),
        })
      },
    }),
  }
})

beforeEach(() => {
  isDark.value = false
})

describe('base footer', () => {
  it('passes current color scheme to vue-about-me', async () => {
    const wrapper = mount(BaseFooter)

    expect(wrapper.getComponent({ name: 'VueAboutMe' }).props('isDark')).toBe(false)

    isDark.value = true
    await nextTick()

    expect(wrapper.getComponent({ name: 'VueAboutMe' }).props('isDark')).toBe(true)
  })
})
