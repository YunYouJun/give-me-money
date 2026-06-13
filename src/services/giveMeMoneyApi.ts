import { ensureCloudbaseClient } from './cloudbase'

export { getApiErrorMessage } from './apiError'

const COUNTER_COLLECTION = 'counters'
const OK_COUNTER_ID = 'ok'
const NO_COUNTER_ID = 'no'

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

export function readOkCounter(): Promise<number> {
  return readCounter(OK_COUNTER_ID)
}

export function readNoCounter(): Promise<number> {
  return readCounter(NO_COUNTER_ID)
}
