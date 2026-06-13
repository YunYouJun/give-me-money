import type { CloudbaseSession, CloudbaseUser } from '~/services/cloudbase'
import { computed, readonly, shallowRef } from 'vue'
import { getApiErrorMessage } from '~/services/apiError'
import { getCloudbaseConfig, isCloudbaseReady } from '~/services/cloudbaseConfig'

const user = shallowRef<CloudbaseUser | null>(null)
const loading = shallowRef(false)
const error = shallowRef<string | null>(null)
const hasChecked = shallowRef(false)

async function refreshUser() {
  if (!isCloudbaseReady()) {
    user.value = null
    error.value = 'message.yunle-sync-unavailable'
    hasChecked.value = true
    return null
  }

  try {
    loading.value = true
    error.value = null
    const { getCurrentUser } = await import('~/services/cloudbase')
    user.value = await getCurrentUser()
    return user.value
  }
  catch (err) {
    user.value = null
    error.value = getApiErrorMessage(err)
    return null
  }
  finally {
    loading.value = false
    hasChecked.value = true
  }
}

async function applySession(session: CloudbaseSession) {
  const { setCurrentSession } = await import('~/services/cloudbase')
  user.value = await setCurrentSession(session)
  return user.value
}

async function syncWithYunleApp() {
  const { isYunleAppBridgeAvailable, requestYunleAppSession } = await import('~/services/yunleAppBridge')
  if (!isYunleAppBridgeAvailable())
    return null

  const result = await requestYunleAppSession()
  if (!result.ok || !result.session)
    return null

  return applySession(result.session)
}

async function syncSilently() {
  if (!isCloudbaseReady() || user.value)
    return user.value

  try {
    loading.value = true
    error.value = null
    const appUser = await syncWithYunleApp()
    if (appUser)
      return appUser

    const { requestYunleSso } = await import('~/services/yunleSso')
    const result = await requestYunleSso('silent')
    if (!result.ok || !result.session)
      return null

    return applySession(result.session)
  }
  catch (err) {
    user.value = null
    error.value = getApiErrorMessage(err)
    return null
  }
  finally {
    loading.value = false
    hasChecked.value = true
  }
}

async function checkSession() {
  const current = await refreshUser()
  if (current)
    return current
  return syncSilently()
}

async function loginWithYunle() {
  if (!isCloudbaseReady()) {
    error.value = 'message.yunle-login-unavailable'
    return null
  }

  try {
    loading.value = true
    error.value = null
    const { isYunleAppBridgeAvailable, requestYunleAppSession } = await import('~/services/yunleAppBridge')
    if (isYunleAppBridgeAvailable()) {
      const appResult = await requestYunleAppSession()
      if (!appResult.ok || !appResult.session) {
        error.value = appResult.reason === 'not_authenticated'
          ? 'message.yunle-app-login-required'
          : 'message.yunle-app-session-unavailable'
        return null
      }
      return applySession(appResult.session)
    }

    const { requestYunleSso } = await import('~/services/yunleSso')
    const result = await requestYunleSso('interactive')
    if (!result.ok || !result.session) {
      error.value = result.reason === 'popup_blocked'
        ? 'message.yunle-popup-blocked'
        : 'message.yunle-login-incomplete'
      return null
    }
    return applySession(result.session)
  }
  catch (err) {
    user.value = null
    error.value = getApiErrorMessage(err)
    return null
  }
  finally {
    loading.value = false
    hasChecked.value = true
  }
}

async function logout() {
  try {
    loading.value = true
    const { signOutCloudbase } = await import('~/services/cloudbase')
    await signOutCloudbase()
  }
  finally {
    user.value = null
    loading.value = false
  }
}

export function useYunleAuth() {
  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    hasChecked: readonly(hasChecked),
    isAuthenticated: computed(() => !!user.value),
    isConfigured: computed(() => getCloudbaseConfig().isConfigured),
    config: getCloudbaseConfig(),
    checkSession,
    refreshUser,
    loginWithYunle,
    logout,
  }
}
