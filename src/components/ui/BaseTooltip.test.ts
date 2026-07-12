import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { TooltipProvider } from 'reka-ui'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import BaseTooltip from './BaseTooltip.vue'

enableAutoUnmount(afterEach)

const TooltipTestHost = defineComponent({
  name: 'TooltipTestHost',
  setup() {
    return () => h(TooltipProvider, { delayDuration: 0 }, {
      default: () => h(BaseTooltip, {
        class: 'custom-trigger-class',
        content: 'GitHub',
      }, {
        default: () => h('button', { type: 'button' }, 'Open GitHub'),
      }),
    })
  },
})

describe('base tooltip', () => {
  it('opens from keyboard focus, forwards trigger attributes and closes with Escape', async () => {
    const wrapper = mount(TooltipTestHost, { attachTo: document.body })
    const trigger = wrapper.get('button')

    expect(trigger.classes()).toContain('base-tooltip')
    expect(trigger.classes()).toContain('custom-trigger-class')

    trigger.element.focus()
    await trigger.trigger('focus')
    await flushPromises()

    expect(document.querySelector('.base-tooltip-content')?.textContent).toContain('GitHub')

    trigger.element.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    }))
    await nextTick()

    expect(document.querySelector('.base-tooltip-content')?.getAttribute('data-state')).toBe('closed')
  })
})
