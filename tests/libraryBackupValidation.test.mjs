import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { validateLibraryBackup, LIBRARY_BACKUP_APP } from '../src/data/libraryBackupValidation.mjs'

const isKnownVerse = (book, chapter, verse) => book === 'Psalms' && chapter === 23 && verse === 6
const validBackup = {
  app: LIBRARY_BACKUP_APP,
  version: 1,
  data: { savedVerses: [{ book: 'Psalms', chapter: 23, verse: 6 }], highlightedVerses: { 'Psalms|23|6': true }, verseNotes: { 'Psalms|23|6': 'Comfort' }, isBookmarked: false, theme: 'light' },
}

test('accepts a valid backup referencing a known verse', () => {
  assert.equal(validateLibraryBackup(validBackup, isKnownVerse), true)
})
test('rejects impossible saved verse references', async () => {
  const fixture = JSON.parse(await readFile(new URL('../test-fixtures/invalid-verse-reference-backup.json', import.meta.url), 'utf8'))
  assert.equal(validateLibraryBackup(fixture, isKnownVerse), false)
})
test('rejects invalid references in highlights and notes', () => {
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, highlightedVerses: { 'Psalms|999|999': true } } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, verseNotes: { 'Psalms|23|999': 'Bad reference' } } }, isKnownVerse), false)
})
test('rejects malformed verse keys and unsupported backup versions', () => {
  assert.equal(validateLibraryBackup({ ...validBackup, data: { ...validBackup.data, highlightedVerses: { 'Psalms|x|6': true } } }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({ ...validBackup, version: 2 }, isKnownVerse), false)
})
