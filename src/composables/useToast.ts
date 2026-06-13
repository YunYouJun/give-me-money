import { readonly, shallowRef } from 'vue'
import { isClient } from '~/utils/isClient'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const toasts = shallowRef<ToastItem[]>([])
let nextToastId = 1

export function showToast(options: ToastOptions) {
  const item: ToastItem = {
    id: nextToastId++,
    message: options.message,
    type: options.type || 'info',
  }

  toasts.value = [...toasts.value, item]

  const duration = options.duration ?? 3200
  if (isClient && duration > 0) {
    window.setTimeout(() => {
      dismissToast(item.id)
    }, duration)
  }
}

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter(item => item.id !== id)
}

export function clearToasts() {
  toasts.value = []
}

export function useToast() {
  return {
    dismissToast,
    showToast,
    toasts: readonly(toasts),
  }
}
