const fallbackErrorMessage = '请求失败，请稍后重试。'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function readErrorText(value: unknown): string | null {
  if (typeof value !== 'string')
    return null

  const text = value.trim()
  if (!text || text === '[object Object]')
    return null

  return text
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error)
    return readErrorText(error.message) || fallbackErrorMessage

  const directMessage = readErrorText(error)
  if (directMessage)
    return directMessage

  if (isRecord(error)) {
    const objectMessage = readErrorText(error.message)
      || readErrorText(error.errMsg)
      || readErrorText(error.errorMessage)
      || readErrorText(error.reason)
      || readErrorText(error.code)

    if (objectMessage)
      return objectMessage
  }

  return fallbackErrorMessage
}
