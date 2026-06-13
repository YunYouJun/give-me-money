import type { Mock } from 'vitest'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { ensureCloudbaseClient, getCurrentUser } from './cloudbase'
import {
  createPayRecord,
  incrementNoCounter,
  listPayRecords,
  maskAccount,
} from './giveMeMoneyApi'

vi.mock('./cloudbase', () => ({
  ensureCloudbaseClient: vi.fn(),
  getCurrentUser: vi.fn(),
}))

function asMock<T extends (...args: never[]) => unknown>(fn: T) {
  return fn as unknown as Mock
}

function createCollectionMock() {
  const docRef = {
    update: vi.fn(),
  }

  const collection = {
    add: vi.fn(),
    count: vi.fn(),
    doc: vi.fn(() => docRef),
    get: vi.fn(),
    limit: vi.fn(() => collection),
    orderBy: vi.fn(() => collection),
    skip: vi.fn(() => collection),
    where: vi.fn(() => collection),
  }

  const db = {
    collection: vi.fn(() => collection),
    command: {
      inc: vi.fn((value: number) => ({ $inc: value })),
    },
  }

  asMock(ensureCloudbaseClient).mockReturnValue({ db })

  return { collection, db, docRef }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('giveMeMoneyApi', () => {
  it('masks accounts before saving public records', () => {
    expect(maskAccount('alice@example.com')).toBe('a***e@example.com')
    expect(maskAccount('13800138000')).toBe('1*********0')
    expect(maskAccount('ab')).toBe('a*')
    expect(maskAccount('')).toBe('')
  })

  it('creates pay_records with current CloudBase uid and without raw account', async () => {
    const { collection } = createCollectionMock()
    collection.add.mockResolvedValue({ id: 'record-id' })
    asMock(getCurrentUser).mockResolvedValue({
      avatar: null,
      email: 'alice@example.com',
      id: 'uid-1',
      isAnonymous: false,
      login: null,
      nickname: 'Alice',
      phone: null,
    })
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)

    await createPayRecord({
      account: 'alice@example.com',
      appId: 'give-me-money',
      name: '  Alice  ',
      password: 'secret123',
      pin: '123456',
      type: 'alipay',
    })

    expect(collection.add).toHaveBeenCalledOnce()
    const payload = collection.add.mock.calls[0]?.[0]
    expect(payload).toMatchObject({
      accountMasked: 'a***e@example.com',
      appId: 'give-me-money',
      authorId: 'uid-1',
      authorName: 'Alice',
      createdAt: 1700000000000,
      name: 'Alice',
      password: 'secret123',
      pin: '123456',
      type: 'alipay',
    })
    expect(payload).not.toHaveProperty('account')
  })

  it('reads pay_records by page ordered by newest first', async () => {
    const { collection } = createCollectionMock()
    collection.count.mockResolvedValue({ total: 2 })
    collection.get.mockResolvedValue({
      data: [
        {
          _id: 'r1',
          accountMasked: 'a***e@example.com',
          authorId: 'uid-1',
          authorName: 'Alice',
          createdAt: 1700000000000,
          name: 'Alice',
          password: 'secret123',
          pin: '123456',
          type: 'wechat',
        },
        { _id: 'invalid-record' },
      ],
    })

    const result = await listPayRecords(2, 20)

    expect(collection.orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    expect(collection.skip).toHaveBeenCalledWith(20)
    expect(collection.limit).toHaveBeenCalledWith(20)
    expect(result.total).toBe(2)
    expect(result.items).toEqual([
      expect.objectContaining({
        accountMasked: 'a***e@example.com',
        id: 'r1',
        type: 'wechat',
      }),
    ])
  })

  it('increments the initialized no counter for signed-in users', async () => {
    const { collection, db, docRef } = createCollectionMock()
    asMock(getCurrentUser).mockResolvedValue({
      avatar: null,
      email: null,
      id: 'uid-1',
      isAnonymous: false,
      login: 'alice',
      nickname: 'Alice',
      phone: null,
    })
    docRef.update.mockResolvedValue({ updated: 1 })
    collection.get.mockResolvedValue({ data: [{ name: 'no', time: 4 }] })
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)

    await expect(incrementNoCounter()).resolves.toBe(4)
    expect(collection.doc).toHaveBeenCalledWith('no')
    expect(db.command.inc).toHaveBeenCalledWith(1)
    expect(docRef.update).toHaveBeenCalledWith({
      name: 'no',
      time: { $inc: 1 },
      updatedAt: 1700000000000,
    })
  })
})
