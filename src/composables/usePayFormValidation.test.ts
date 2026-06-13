import { describe, expect, it } from 'vitest'
import { validatePayInfo } from './usePayFormValidation'

describe('pay form validation', () => {
  it('requires account, password, and numeric six-digit pin', () => {
    expect(validatePayInfo({ account: '', password: '', pin: '' }, key => key)).toEqual({
      account: 'prompt.pay.account',
      password: 'prompt.pay.password',
      pin: 'prompt.pay.pin',
    })
    expect(validatePayInfo({ account: 'a', password: '12345', pin: 'abc' }, key => key)).toEqual({
      account: 'error.validator.account',
      password: 'error.validator.password',
      pin: 'error.validator.pin-length',
    })
    expect(validatePayInfo({ account: 'alice', password: 'secret1', pin: '123456' }, key => key)).toEqual({})
  })
})
