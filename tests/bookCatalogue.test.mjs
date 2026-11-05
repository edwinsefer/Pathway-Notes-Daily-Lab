import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BOOK_CATALOGUE_SCHEMA_VERSION,
  BOOK_CATALOGUE_STORAGE_KEY,
  createBookRecord,
  loadBookCatalogue,
  saveBookCatalogue,
  validateBookCatalogue,
  validateBookRecord,
} from '../src/data/bookCatalogue.mjs'

const timestamp = '2026-11-05T10:00:00.000Z'
const validRecord = (overrides = {}) => ({
  id: 'book-1',
  title: 'Knowing God',
  authors: ['J. I. Packer'],
  format: 'record-only',
  fileHandleStatus: 'not-linked',
  tags: ['theology'],
  readingStatus: 'to-read',
  createdAt: timestamp,
  updatedAt: timestamp,
  ...overrides,
})
const memoryStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    values,
  }
}

test('accepts a valid metadata-only Christian book record', () => {
  assert.deepEqual(validateBookRecord(validRecord()), { valid: true, errors: [] })
})

test('rejects missing title, unsupported format, invalid file size, and invalid timestamps', () => {
  const result = validateBookRecord(validRecord({ title: ' ', format: 'doc', fileSizeBytes: -1, createdAt: 'yesterday' }))
  assert.equal(result.valid, false)
  assert.ok(result.errors.some((error) => error.includes('title')))
  assert.ok(result.errors.some((error) => error.includes('format')))
  assert.ok(result.errors.some((error) => error.includes('fileSizeBytes')))
  assert.ok(result.errors.some((error) => error.includes('createdAt')))
})

test('rejects duplicate record IDs in a catalogue', () => {
  const result = validateBookCatalogue([validRecord(), validRecord({ title: 'Different title' })])
  assert.equal(result.valid, false)
  assert.ok(result.errors.some((error) => error.includes('duplicate id')))
})

test('creates a normalized record with stable schema defaults', () => {
  const record = createBookRecord({ title: '  Mere Christianity  ', authors: ['C. S. Lewis'] }, { id: 'book-2', now: timestamp })
  assert.equal(record.title, 'Mere Christianity')
  assert.equal(record.format, 'record-only')
  assert.equal(record.readingStatus, 'to-read')
  assert.equal(record.id, 'book-2')
})

test('preserves optional language, category, and reading status metadata', () => {
  const record = createBookRecord({
    title: 'Knowing God',
    authors: ['J. I. Packer'],
    language: 'English',
    category: 'Theology',
    readingStatus: 'reading',
  }, { id: 'book-metadata', now: timestamp })
  assert.equal(record.language, 'English')
  assert.equal(record.category, 'Theology')
  assert.equal(record.readingStatus, 'reading')
  assert.deepEqual(validateBookRecord(record), { valid: true, errors: [] })
})

test('saves and reloads a versioned catalogue independently', () => {
  const storage = memoryStorage({ 'pathway-saved-verses': '[{"book":"Genesis","chapter":1,"verse":1}]' })
  const record = validRecord()
  assert.deepEqual(saveBookCatalogue(storage, [record]), { saved: true, errors: [] })
  const stored = JSON.parse(storage.getItem(BOOK_CATALOGUE_STORAGE_KEY))
  assert.equal(stored.schemaVersion, BOOK_CATALOGUE_SCHEMA_VERSION)
  assert.deepEqual(loadBookCatalogue(storage).records, [record])
  assert.equal(storage.getItem('pathway-saved-verses'), '[{"book":"Genesis","chapter":1,"verse":1}]')
})

test('does not overwrite malformed or unsupported catalogue data during recovery', () => {
  const original = '{"schemaVersion":99,"records":[]}'
  const storage = memoryStorage({ [BOOK_CATALOGUE_STORAGE_KEY]: original })
  const result = loadBookCatalogue(storage)
  assert.equal(result.valid, false)
  assert.deepEqual(result.records, [])
  assert.equal(storage.getItem(BOOK_CATALOGUE_STORAGE_KEY), original)
})

test('does not save invalid records', () => {
  const storage = memoryStorage()
  const result = saveBookCatalogue(storage, [validRecord({ title: '' })])
  assert.equal(result.saved, false)
  assert.equal(storage.getItem(BOOK_CATALOGUE_STORAGE_KEY), null)
})
