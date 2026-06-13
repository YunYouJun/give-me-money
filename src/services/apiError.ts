export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error)
    return error.message
  return String(error || '请求失败，请稍后重试。')
}
