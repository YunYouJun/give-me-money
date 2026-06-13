import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BasePinInput from './BasePinInput.vue'

function mountBasePinInput(modelValue = '') {
  const wrapper = mount(BasePinInput, {
    props: {
      'modelValue': modelValue,
      'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
    },
  })

  return wrapper
}

describe('base pin input', () => {
  it('renders six masked numeric inputs by default', () => {
    const wrapper = mountBasePinInput()
    const inputs = wrapper.findAll('.base-pin-input-cell')

    expect(inputs).toHaveLength(6)
    expect(inputs[0].attributes('type')).toBe('password')
    expect(inputs[0].attributes('inputmode')).toBe('numeric')
    expect(inputs[0].attributes('pattern')).toBe('[0-9]*')
  })

  it('updates model value as a string and preserves leading zeroes', async () => {
    const wrapper = mountBasePinInput()
    const inputs = wrapper.findAll('.base-pin-input-cell')

    await inputs[0].setValue('0')
    await inputs[1].setValue('1')

    expect(wrapper.props('modelValue')).toBe('01')
  })

  it('filters pasted content to numeric pin characters', async () => {
    const wrapper = mountBasePinInput()
    const [input] = wrapper.findAll('.base-pin-input-cell')

    await input.trigger('paste', {
      clipboardData: {
        getData: () => '12a3456',
      },
    })

    expect(wrapper.props('modelValue')).toBe('123456')
  })
})
