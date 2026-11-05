export const BOOK_CATALOGUE_STORAGE_KEY = 'pathway-books-catalogue:v1'
export const BOOK_CATALOGUE_SCHEMA_VERSION = 1

const FORMATS = new Set(['pdf', 'epub', 'record-only'])
const FILE_HANDLE_STATUSES = new Set(['not-linked', 'linked-in-session'])
const READING_STATUSES = new Set(['to-read', 'reading', 'completed'])

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isString = (value) => typeof value === 'string'
const isOptionalString = (value) => value === undefined || isString(value)
const isStringArray = (value) => Array.isArray(value) && value.every(isString)
const isIsoTimestamp = (value) => isString(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))

export function validateBookRecord(record) {
  if (!isObject(record)) return { valid: false, errors: ['record must be an object'] }
  const errors = []
  if (!isString(record.id) || !record.id.trim()) errors.push('id is required')
  if (!isString(record.title) || !record.title.trim()) errors.push('title is required')
  if (!isStringArray(record.authors)) errors.push('authors must be an array of strings')
  if (!isOptionalString(record.language)) errors.push('language must be a string')
  if (!isOptionalString(record.category)) errors.push('category must be a string')
  if (!FORMATS.has(record.format)) errors.push('format is invalid')
  if (!isOptionalString(record.fileName)) errors.push('fileName must be a string')
  if (record.fileSizeBytes !== undefined && (!Number.isSafeInteger(record.fileSizeBytes) || record.fileSizeBytes < 0)) errors.push('fileSizeBytes must be a non-negative safe integer')
  if (!FILE_HANDLE_STATUSES.has(record.fileHandleStatus)) errors.push('fileHandleStatus is invalid')
  if (!isOptionalString(record.description)) errors.push('description must be a string')
  if (!isStringArray(record.tags)) errors.push('tags must be an array of strings')
  if (!READING_STATUSES.has(record.readingStatus)) errors.push('readingStatus is invalid')
  if (!isIsoTimestamp(record.createdAt)) errors.push('createdAt must be an ISO timestamp')
  if (!isIsoTimestamp(record.updatedAt)) errors.push('updatedAt must be an ISO timestamp')
  if (record.format === 'record-only' && (record.fileName !== undefined || record.fileSizeBytes !== undefined || record.fileHandleStatus === 'linked-in-session')) {
    errors.push('record-only entries cannot contain linked-file metadata')
  }
  return { valid: errors.length === 0, errors }
}

export function validateBookCatalogue(records) {
  if (!Array.isArray(records)) return { valid: false, errors: ['records must be an array'] }
  const errors = []
  const ids = new Set()
  records.forEach((record, index) => {
    const result = validateBookRecord(record)
    result.errors.forEach((error) => errors.push(`record ${index + 1}: ${error}`))
    if (isObject(record) && isString(record.id) && record.id.trim()) {
      if (ids.has(record.id)) errors.push(`duplicate id: ${record.id}`)
      ids.add(record.id)
    }
  })
  return { valid: errors.length === 0, errors }
}

export function createBookRecord(input, options = {}) {
  const now = options.now ?? new Date().toISOString()
  const id = options.id ?? globalThis.crypto?.randomUUID?.() ?? `book-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const record = {
    id,
    title: typeof input.title === 'string' ? input.title.trim() : '',
    authors: Array.isArray(input.authors) ? input.authors : [],
    format: input.format ?? 'record-only',
    fileHandleStatus: input.fileHandleStatus ?? 'not-linked',
    tags: Array.isArray(input.tags) ? input.tags : [],
    readingStatus: input.readingStatus ?? 'to-read',
    createdAt: now,
    updatedAt: now,
  }
  for (const field of ['language', 'category', 'fileName', 'fileSizeBytes', 'description']) {
    if (input[field] !== undefined && input[field] !== '') record[field] = input[field]
  }
  const result = validateBookRecord(record)
  if (!result.valid) throw new TypeError(result.errors.join('; '))
  return record
}

export function loadBookCatalogue(storage) {
  let raw
  try {
    raw = storage.getItem(BOOK_CATALOGUE_STORAGE_KEY)
  } catch {
    return { records: [], valid: false, errors: ['catalogue storage could not be read'] }
  }
  if (raw === null) return { records: [], valid: true, errors: [] }
  try {
    const parsed = JSON.parse(raw)
    if (!isObject(parsed) || parsed.schemaVersion !== BOOK_CATALOGUE_SCHEMA_VERSION) {
      return { records: [], valid: false, errors: ['unsupported or malformed catalogue version'] }
    }
    const result = validateBookCatalogue(parsed.records)
    return result.valid
      ? { records: parsed.records, valid: true, errors: [] }
      : { records: [], valid: false, errors: result.errors }
  } catch {
    return { records: [], valid: false, errors: ['catalogue data is not valid JSON'] }
  }
}

export function saveBookCatalogue(storage, records) {
  const result = validateBookCatalogue(records)
  if (!result.valid) return { saved: false, errors: result.errors }
  try {
    storage.setItem(BOOK_CATALOGUE_STORAGE_KEY, JSON.stringify({
      schemaVersion: BOOK_CATALOGUE_SCHEMA_VERSION,
      records,
    }))
    return { saved: true, errors: [] }
  } catch {
    return { saved: false, errors: ['catalogue storage could not be written'] }
  }
}
