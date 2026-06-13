import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { clearToasts, showToast } from '~/composables/useToast'
import BaseToastHost from './BaseToastHost.vue'

describe('base toast host', () => {
  it('renders and dismisses toast messages', async () => {
    vi.useFakeTimers()
    clearToasts()
    const wrapper = mount(BaseToastHost)

    showToast({ message: 'Saved', type: 'success', duration: 1000 })
    await flushPromises()

    expect(wrapper.text()).toContain('Saved')
    expect(wrapper.get('[role="status"]').classes()).toContain('toast--success')

    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()
    expect(wrapper.text()).not.toContain('Saved')
  })
})
