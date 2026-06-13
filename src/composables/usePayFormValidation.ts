export interface PayValidationInput {
  account: string
  password: string
  pin: string
}

export type PayValidationErrors = Partial<Record<keyof PayValidationInput, string>>

export function validatePayInfo(input: PayValidationInput, t: (key: string) => string): PayValidationErrors {
  const errors: PayValidationErrors = {}

  if (!input.account)
    errors.account = t('prompt.pay.account')
  else if (input.account.length < 2)
    errors.account = t('error.validator.account')

  if (!input.password)
    errors.password = t('prompt.pay.password')
  else if (input.password.length < 6)
    errors.password = t('error.validator.password')

  if (!input.pin)
    errors.pin = t('prompt.pay.pin')
  else if (input.pin.length !== 6)
    errors.pin = t('error.validator.pin-length')
  else if (!/^\d{6}$/.test(input.pin))
    errors.pin = t('error.validator.pin')

  return errors
}
