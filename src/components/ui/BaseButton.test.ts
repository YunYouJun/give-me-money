import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseButton from './BaseButton.vue'

describe('base button', () => {
  it('emits click only when enabled', async () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Save' } })

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)

    await wrapper.setProps({ disabled: true })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('announces loading state', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
      slots: { default: 'Save' },
    })

    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('Save')
  })
})
