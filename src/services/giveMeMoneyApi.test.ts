import type { Mock } from 'vitest'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { ensureCloudbaseClient } from './cloudbase'
import {
  readNoCounter,
  readOkCounter,
} from './giveMeMoneyApi'

vi.mock('./cloudbase', () => ({
  ensureCloudbaseClient: vi.fn(),
}))

function asMock<T extends (...args: never[]) => unknown>(fn: T) {
  return fn as unknown as Mock
}

function createCollectionMock() {
  const collection = {
    get: vi.fn(),
    limit: vi.fn(() => collection),
    where: vi.fn(() => collection),
  }

  const db = {
    collection: vi.fn(() => collection),
  }

  asMock(ensureCloudbaseClient).mockReturnValue({ db })

  return { collection, db }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('giveMeMoneyApi', () => {
  it('reads the historical ok counter without touching pay records', async () => {
    const { collection, db } = createCollectionMock()
    collection.get.mockResolvedValue({ data: [{ name: 'ok', time: 7 }] })

    await expect(readOkCounter()).resolves.toBe(7)

    expect(db.collection).toHaveBeenCalledWith('counters')
    expect(db.collection).not.toHaveBeenCalledWith('pay_records')
    expect(collection.where).toHaveBeenCalledWith({ name: 'ok' })
    expect(collection.limit).toHaveBeenCalledWith(1)
  })

  it('reads the historical no counter', async () => {
    const { collection } = createCollectionMock()
    collection.get.mockResolvedValue({ data: [{ name: 'no', time: 4 }] })

    await expect(readNoCounter()).resolves.toBe(4)

    expect(collection.where).toHaveBeenCalledWith({ name: 'no' })
  })

  it('treats a missing counters collection as zero', async () => {
    const { collection } = createCollectionMock()
    collection.get.mockResolvedValue({
      code: 'DATABASE_COLLECTION_NOT_EXIST',
      message: 'Db or Table not exist: counters. Please check your request.',
    })

    await expect(readOkCounter()).resolves.toBe(0)
  })
})
