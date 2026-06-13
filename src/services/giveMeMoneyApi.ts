import { getApiErrorMessage } from './apiError'
import { ensureCloudbaseClient } from './cloudbase'

export { getApiErrorMessage } from './apiError'

const COUNTER_COLLECTION = 'counters'
const COUNTER_VOTE_COLLECTION = 'counter_votes'
const OK_COUNTER_ID = 'ok' as const
const NO_COUNTER_ID = 'no' as const

export type CounterName = typeof OK_COUNTER_ID | typeof NO_COUNTER_ID

export interface CounterVoteResult {
  counterName: CounterName
  value: number
}

interface CounterDbCommand {
  inc: (value: number) => unknown
}

interface CounterTransactionDocument {
  create: (data: Record<string, unknown>) => Promise<unknown>
  get: () => Promise<unknown>
  set: (data: Record<string, unknown>) => Promise<unknown>
  update: (data: Record<string, unknown>) => Promise<unknown>
}

interface CounterTransactionCollection {
  doc: (id: string) => CounterTransactionDocument
}

interface CounterTransaction {
  collection: (name: string) => CounterTransactionCollection
}

interface TransactionalCounterDb {
  command: CounterDbCommand
  runTransaction: <T>(callback: (transaction: CounterTransaction) => Promise<T>, times?: number) => Promise<T>
}

export class CounterLoginRequiredError extends Error {
  constructor() {
    super('请先登录云乐坊后再提交。')
    this.name = 'CounterLoginRequiredError'
  }
}

export class CounterAlreadySubmittedError extends Error {
  readonly counterName?: CounterName

  constructor(counterName?: CounterName) {
    super('你已经提交过一次啦。')
    this.name = 'CounterAlreadySubmittedError'
    this.counterName = counterName
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function isCounterName(value: unknown): value is CounterName {
  return value === OK_COUNTER_ID || value === NO_COUNTER_ID
}

function hasMissingCollectionError(value: unknown, collectionName: string): boolean {
  if (!isRecord(value))
    return false

  const message = [
    readString(value.code),
    readString(value.message),
    readString(value.errMsg),
  ].join(' ').toLowerCase()

  return message.includes(collectionName)
    && (message.includes('not exist') || message.includes('not_exist') || message.includes('not found'))
}

function hasDuplicateDocumentError(value: unknown): boolean {
  if (!isRecord(value))
    return false

  const message = [
    readString(value.code),
    readString(value.message),
    readString(value.errMsg),
  ].join(' ').toLowerCase()

  return message.includes('duplicate')
    || message.includes('already exist')
    || message.includes('already_exists')
    || message.includes('document exists')
}

function throwOnResultError(result: unknown) {
  if (!isRecord(result))
    return

  const code = readString(result.code)
  const message = readString(result.message)

  if (code || message)
    throw new Error(message || code)
}

function isTransactionalCounterDb(value: unknown): value is TransactionalCounterDb {
  if (!isRecord(value) || typeof value.runTransaction !== 'function')
    return false

  return isRecord(value.command) && typeof value.command.inc === 'function'
}

function getTransactionDb(db: unknown): TransactionalCounterDb {
  if (!isTransactionalCounterDb(db))
    throw new Error('当前 CloudBase SDK 不支持事务计数。')

  return db
}

function hasDocumentData(result: unknown): boolean {
  if (!isRecord(result))
    return false

  const data = result.data
  if (Array.isArray(data))
    return data.some(item => isRecord(item))

  return isRecord(data)
}

function readVoteCounterName(result: unknown): CounterName | undefined {
  if (!isRecord(result))
    return undefined

  const data = result.data
  if (isRecord(data) && isCounterName(data.counterName))
    return data.counterName

  if (Array.isArray(data)) {
    const first = data.find(item => isRecord(item))
    if (isRecord(first) && isCounterName(first.counterName))
      return first.counterName
  }

  return undefined
}

function readSessionUserId(result: unknown): string | null {
  if (!isRecord(result))
    return null

  const data = result.data
  if (!isRecord(data))
    return null

  const session = data.session
  if (!isRecord(session))
    return null

  const user = isRecord(session.user) ? session.user : data.user
  if (!isRecord(user) || readBoolean(user.is_anonymous))
    return null

  const id = user.id
  if (typeof id !== 'string' && typeof id !== 'number')
    return null

  const userId = String(id).trim()
  return userId || null
}

async function requireCurrentUserId(): Promise<string> {
  const { auth } = ensureCloudbaseClient()
  const result: unknown = await auth.getSession()

  if (isRecord(result) && result.error)
    throw new Error(getApiErrorMessage(result.error))

  const userId = readSessionUserId(result)
  if (!userId)
    throw new CounterLoginRequiredError()

  return userId
}

async function readCounter(name: string): Promise<number> {
  const { db } = ensureCloudbaseClient()
  const result = await db.collection(COUNTER_COLLECTION)
    .where({ name })
    .limit(1)
    .get()

  if (result.code) {
    if (hasMissingCollectionError(result, COUNTER_COLLECTION))
      return 0

    throw new Error(result.message || result.code)
  }

  const first = result.data[0]
  if (!isRecord(first))
    return 0

  return readNumber(first.time)
}

async function createVoteAndIncrementCounter(counterName: CounterName, userId: string): Promise<void> {
  const { db } = ensureCloudbaseClient()
  const transactionDb = getTransactionDb(db)
  const now = new Date()

  await transactionDb.runTransaction(async (transaction) => {
    const voteDoc = transaction.collection(COUNTER_VOTE_COLLECTION).doc(userId)
    const existingVote = await voteDoc.get()
    if (hasDocumentData(existingVote))
      throw new CounterAlreadySubmittedError(readVoteCounterName(existingVote))

    await voteDoc.create({
      counterName,
      createdAt: now,
      uid: userId,
    })

    const counterDoc = transaction.collection(COUNTER_COLLECTION).doc(counterName)
    const updateResult = await counterDoc.update({
      name: counterName,
      time: transactionDb.command.inc(1),
      updatedAt: now,
    })
    throwOnResultError(updateResult)

    if (isRecord(updateResult) && readNumber(updateResult.updated) > 0)
      return

    const setResult = await counterDoc.set({
      createdAt: now,
      name: counterName,
      time: 1,
      updatedAt: now,
    })
    throwOnResultError(setResult)
  })
}

export async function submitCounterVote(counterName: CounterName): Promise<CounterVoteResult> {
  const userId = await requireCurrentUserId()

  try {
    await createVoteAndIncrementCounter(counterName, userId)
  }
  catch (error) {
    if (error instanceof CounterAlreadySubmittedError)
      throw error
    if (hasDuplicateDocumentError(error))
      throw new CounterAlreadySubmittedError()

    throw error
  }

  return {
    counterName,
    value: await readCounter(counterName),
  }
}

export function readOkCounter(): Promise<number> {
  return readCounter(OK_COUNTER_ID)
}

export function readNoCounter(): Promise<number> {
  return readCounter(NO_COUNTER_ID)
}
