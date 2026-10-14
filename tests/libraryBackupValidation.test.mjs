import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { validateLibraryBackup, LIBRARY_BACKUP_APP } from '../src/data/libraryBackupValidation.mjs'

// Mirrors the callback contract used by App.tsx: only references approved by
// the Scripture registry should be accepted. The UI integration calls
// findApprovedChapter() and checks the verse within that chapter.
const approvedReferences = new Set([
  'Psalms|23|6',
  'Psalms|46|10',
  'Jeremiah|33|3',
])
const isKnownVerse = (book, chapter, verse) => approvedReferences.has(`${book}|${chapter}|${verse}`)

const validBackup = {
  app: LIBRARY_BACKUP_APP,
  version: 1,
  data: {
    savedVerses: [{ book: 'Psalms', chapter: 23, verse: 6 }],
    highlightedVerses: { 'Psalms|23|6': true },
    verseNotes: { 'Psalms|23|6': 'Comfort' },
    isBookmarked: false,
    theme: 'light',
  },
}

test('accepts a valid backup referencing an approved verse', () => {
  assert.equal(validateLibraryBackup(validBackup, isKnownVerse), true)
})

test('rejects impossible saved verse references from the fixture', async () => {
  const fixture = JSON.parse(await readFile(new URL('../test-fixtures/invalid-verse-reference-backup.json', import.meta.url), 'utf8'))
  assert.equal(validateLibraryBackup(fixture, isKnownVerse), false)
})

test('rejects a known book with an impossible chapter or verse', () => {
  assert.equal(validateLibraryBackup({
    ...validBackup,
    data: { ...validBackup.data, savedVerses: [{ book: 'Psalms', chapter: 999, verse: 999 }] },
  }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({
    ...validBackup,
    data: { ...validBackup.data, savedVerses: [{ book: 'Psalms', chapter: 23, verse: 999 }] },
  }, isKnownVerse), false)
})

test('rejects invalid references in highlights and notes', () => {
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, highlightedVerses: { 'Psalms|999|999': true } } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, verseNotes: { 'Psalms|23|999': 'Bad reference' } } }, isKnownVerse), false)
})

test('rejects malformed verse keys and unsupported backup versions', () => {
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, highlightedVerses: { 'Psalms|x|6': true } } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, version: 2 }, isKnownVerse), false)
})

test('rejects malformed data shapes and unsafe numeric references', () => {
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, savedVerses: {} } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, highlightedVerses: [] } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, verseNotes: [] } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, savedVerses: [{ book: 'Psalms', chapter: Number.MAX_SAFE_INTEGER + 1, verse: 6 }] } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, theme: 'system' } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, app: 'Other App' }, isKnownVerse), false)
})

test('rejects null and missing backup data without throwing', () => {
  assert.equal(validateLibraryBackup(null, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ app: LIBRARY_BACKUP_APP, version: 1 }, isKnownVerse), false)
})
