import type { CloudbaseUser } from './cloudbase'
import type { PayMethod } from '~/types/app'
import { ensureCloudbaseClient, getCurrentUser } from './cloudbase'

export { getApiErrorMessage } from './apiError'

const PAY_COLLECTION = 'pay_records'
const COUNTER_COLLECTION = 'counters'
const NO_COUNTER_ID = 'no'

export interface PayRecord {
  id: string
  appId: string
  authorId: string
  authorName: string
  name: string
  type: PayMethod
  accountMasked: string
  password: string
  pin: string
  createdAt: number
}

export interface CreatePayRecordInput {
  appId: string
  name: string
  type: PayMethod
  account: string
  password: string
  pin: string
}

export interface PayRecordPage {
  items: PayRecord[]
  total: number
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

function normalizePayMethod(value: unknown): PayMethod {
  return value === 'wechat' ? 'wechat' : 'alipay'
}

export function maskAccount(account: string): string {
  const value = account.trim()
  if (value.length <= 2)
    return value ? `${value[0]}*` : ''

  const [name, domain] = value.split('@')
  if (domain && name) {
    const head = name[0]
    const tail = name.length > 1 ? name[name.length - 1] : ''
    return `${head}${'*'.repeat(Math.max(3, name.length - 2))}${tail}@${domain}`
  }

  return `${value[0]}${'*'.repeat(Math.max(3, value.length - 2))}${value[value.length - 1]}`
}

function formatAuthorName(user: CloudbaseUser): string {
  return user.nickname || user.login || user.email || user.phone || user.id
}

function normalizePayRecord(value: unknown): PayRecord | null {
  if (!isRecord(value))
    return null

  const id = readString(value._id) || readString(value.id)
  const authorId = readString(value.authorId)
  const accountMasked = readString(value.accountMasked)
  if (!id || !authorId || !accountMasked)
    return null

  return {
    id,
    appId: readString(value.appId, 'give-me-money'),
    authorId,
    authorName: readString(value.authorName, '云乐坊用户'),
    name: readString(value.name),
    type: normalizePayMethod(value.type),
    accountMasked,
    password: readString(value.password),
    pin: readString(value.pin),
    createdAt: readNumber(value.createdAt),
  }
}

export async function getPayRecordCount(): Promise<number> {
  const { db } = ensureCloudbaseClient()
  const result = await db.collection(PAY_COLLECTION).count()
  if (result.code) {
    if (hasMissingCollectionError(result, PAY_COLLECTION))
      return 0

    throw new Error(result.message || result.code)
  }
  return result.total
}

export async function listPayRecords(page: number, pageSize: number): Promise<PayRecordPage> {
  const { db } = ensureCloudbaseClient()
  const skip = Math.max(0, page - 1) * pageSize
  const [recordsResult, total] = await Promise.all([
    db.collection(PAY_COLLECTION)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get(),
    getPayRecordCount(),
  ])

  if (recordsResult.code) {
    if (hasMissingCollectionError(recordsResult, PAY_COLLECTION)) {
      return {
        items: [],
        total: 0,
      }
    }

    throw new Error(recordsResult.message || recordsResult.code)
  }

  const records = Array.isArray(recordsResult.data) ? recordsResult.data as unknown[] : []

  return {
    items: records
      .map(normalizePayRecord)
      .filter((item): item is PayRecord => item !== null),
    total,
  }
}

export async function createPayRecord(input: CreatePayRecordInput): Promise<void> {
  const { db } = ensureCloudbaseClient()
  const user = await getCurrentUser()
  if (!user)
    throw new Error('请先登录云乐坊账号。')

  const result = await db.collection(PAY_COLLECTION).add({
    appId: input.appId,
    authorId: user.id,
    authorName: formatAuthorName(user),
    name: input.name.trim(),
    type: input.type,
    accountMasked: maskAccount(input.account),
    password: input.password,
    pin: input.pin,
    createdAt: Date.now(),
  })

  if (result.code)
    throw new Error(result.message || result.code)
}

export async function readNoCounter(): Promise<number> {
  const { db } = ensureCloudbaseClient()
  const result = await db.collection(COUNTER_COLLECTION)
    .where({ name: NO_COUNTER_ID })
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

export async function incrementNoCounter(): Promise<number> {
  const { db } = ensureCloudbaseClient()
  const user = await getCurrentUser()
  if (!user)
    throw new Error('请先登录云乐坊账号。')

  const updateResult = await db.collection(COUNTER_COLLECTION)
    .doc(NO_COUNTER_ID)
    .update({
      name: NO_COUNTER_ID,
      time: db.command.inc(1),
      updatedAt: Date.now(),
    })

  if (updateResult.code)
    throw new Error(updateResult.message || updateResult.code)
  if (updateResult.updated !== 1)
    throw new Error('拒绝计数尚未初始化，请先在 CloudBase 创建 counters/no。')

  return readNoCounter()
}
