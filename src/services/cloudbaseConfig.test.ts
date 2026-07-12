import { describe, expect, it, vi } from 'vitest'
import { getCloudbaseConfig, isCloudbaseReady } from './cloudbaseConfig'

describe('cloudbase config', () => {
  it('treats the publishable access key as optional', () => {
    vi.stubEnv('VITE_CLOUDBASE_ACCESS_KEY', '')

    expect(getCloudbaseConfig()).toEqual(expect.objectContaining({
      accessKey: '',
      envId: 'yunlefun-8g7ybcxc7345c490',
      isConfigured: true,
      region: 'ap-shanghai',
    }))
    expect(isCloudbaseReady()).toBe(true)
  })
})
