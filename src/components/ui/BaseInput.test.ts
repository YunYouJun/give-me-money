import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseInput from './BaseInput.vue'

describe('base input', () => {
  it('updates model value on input', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        'modelValue': '',
        'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
      },
    })

    await wrapper.get('input').setValue('alice')
    expect(wrapper.props('modelValue')).toBe('alice')
  })
})
