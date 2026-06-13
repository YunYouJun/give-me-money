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
  CounterAlreadySubmittedError,
  CounterLoginRequiredError,
  readNoCounter,
  readOkCounter,
  submitCounterVote,
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

interface MockTransactionDocument {
  create: (data: Record<string, unknown>) => Promise<unknown>
  get: () => Promise<unknown>
  set: (data: Record<string, unknown>) => Promise<unknown>
  update: (data: Record<string, unknown>) => Promise<unknown>
}

interface MockTransactionCollection {
  doc: (id: string) => MockTransactionDocument
}

interface MockTransaction {
  collection: (name: string) => MockTransactionCollection
}

type TransactionCallback = (transaction: MockTransaction) => Promise<unknown>

function createSubmissionMock() {
  const counterCollection = {
    get: vi.fn().mockResolvedValue({ data: [{ name: 'ok', time: 8 }] }),
    limit: vi.fn(() => counterCollection),
    where: vi.fn(() => counterCollection),
  }

  const voteDoc = {
    create: vi.fn().mockResolvedValue({ inserted: 1 }),
    get: vi.fn().mockResolvedValue({ data: null }),
    set: vi.fn().mockResolvedValue({ updated: 1 }),
    update: vi.fn().mockResolvedValue({ updated: 1 }),
  }

  const counterDoc = {
    create: vi.fn().mockResolvedValue({ inserted: 1 }),
    get: vi.fn().mockResolvedValue({ data: { name: 'ok', time: 7 } }),
    set: vi.fn().mockResolvedValue({ updated: 1 }),
    update: vi.fn().mockResolvedValue({ updated: 1 }),
  }

  const voteCollection = {
    doc: vi.fn(() => voteDoc),
  }
  const counterTransactionCollection = {
    doc: vi.fn(() => counterDoc),
  }

  const transaction: MockTransaction = {
    collection: vi.fn((name: string) => {
      if (name === 'counter_votes')
        return voteCollection
      return counterTransactionCollection
    }),
  }

  const auth = {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-1',
            is_anonymous: false,
          },
        },
      },
      error: null,
    }),
  }

  const db = {
    collection: vi.fn(() => counterCollection),
    command: {
      inc: vi.fn((value: number) => ({ $inc: value })),
    },
    runTransaction: vi.fn((callback: TransactionCallback) => callback(transaction)),
  }

  asMock(ensureCloudbaseClient).mockReturnValue({ auth, db })

  return {
    auth,
    counterCollection,
    counterDoc,
    counterTransactionCollection,
    db,
    transaction,
    voteCollection,
    voteDoc,
  }
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

  it('requires a real signed-in user before submitting a counter vote', async () => {
    const { auth, db } = createSubmissionMock()
    auth.getSession.mockResolvedValue({ data: {}, error: null })

    await expect(submitCounterVote('ok')).rejects.toBeInstanceOf(CounterLoginRequiredError)

    expect(db.runTransaction).not.toHaveBeenCalled()
  })

  it('creates a per-user vote marker and increments the public counter in a transaction', async () => {
    const { counterDoc, counterTransactionCollection, db, voteCollection, voteDoc } = createSubmissionMock()

    await expect(submitCounterVote('ok')).resolves.toEqual({
      counterName: 'ok',
      value: 8,
    })

    expect(voteCollection.doc).toHaveBeenCalledWith('user-1')
    expect(voteDoc.create).toHaveBeenCalledWith(expect.objectContaining({
      counterName: 'ok',
      uid: 'user-1',
    }))
    expect(counterTransactionCollection.doc).toHaveBeenCalledWith('ok')
    expect(db.command.inc).toHaveBeenCalledWith(1)
    expect(counterDoc.update).toHaveBeenCalledWith(expect.objectContaining({
      name: 'ok',
      time: { $inc: 1 },
    }))
  })

  it('initializes a missing public counter document inside the transaction', async () => {
    const { counterDoc } = createSubmissionMock()
    counterDoc.update.mockResolvedValue({ updated: 0 })

    await expect(submitCounterVote('no')).resolves.toEqual({
      counterName: 'no',
      value: 8,
    })

    expect(counterDoc.set).toHaveBeenCalledWith(expect.objectContaining({
      name: 'no',
      time: 1,
    }))
  })

  it('does not increment when the user already submitted once', async () => {
    const { counterDoc, voteDoc } = createSubmissionMock()
    voteDoc.get.mockResolvedValue({ data: { counterName: 'ok', uid: 'user-1' } })

    await expect(submitCounterVote('no')).rejects.toBeInstanceOf(CounterAlreadySubmittedError)

    expect(voteDoc.create).not.toHaveBeenCalled()
    expect(counterDoc.update).not.toHaveBeenCalled()
  })

  it('maps duplicate vote marker creation to an already-submitted error', async () => {
    const { counterDoc, voteDoc } = createSubmissionMock()
    voteDoc.create.mockRejectedValue({
      code: 'DATABASE_DUPLICATE_KEY',
      message: 'duplicate key',
    })

    await expect(submitCounterVote('ok')).rejects.toBeInstanceOf(CounterAlreadySubmittedError)

    expect(counterDoc.update).not.toHaveBeenCalled()
  })
})
