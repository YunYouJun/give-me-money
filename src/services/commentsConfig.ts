const DEFAULT_COMMENTS_URL = 'https://apps.yunle.fun'

export function getCommentsUrl(): string {
  const value = import.meta.env.VITE_GMM_COMMENTS_URL || DEFAULT_COMMENTS_URL

  try {
    return new URL(value).toString()
  }
  catch {
    return DEFAULT_COMMENTS_URL
  }
}
