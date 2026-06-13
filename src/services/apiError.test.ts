import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './apiError'

describe('api error message', () => {
  it('reads useful messages from plain object errors', () => {
    expect(getApiErrorMessage({ message: 'CloudBase session expired' })).toBe('CloudBase session expired')
    expect(getApiErrorMessage({ errMsg: 'permission denied' })).toBe('permission denied')
    expect(getApiErrorMessage({ code: 'AUTH_LOGIN_FAILED' })).toBe('AUTH_LOGIN_FAILED')
  })

  it('does not expose [object Object] for opaque object errors', () => {
    expect(getApiErrorMessage({ detail: { reason: 'nested' } })).toBe('请求失败，请稍后重试。')
  })
})
