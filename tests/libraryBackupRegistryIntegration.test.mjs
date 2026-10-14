import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { validateLibraryBackup, LIBRARY_BACKUP_APP } from '../src/data/libraryBackupValidation.mjs'

let vite
let findApprovedChapter

before(async () => {
  vite = await createServer({
    configFile: false,
    root: process.cwd(),
    server: { middlewareMode: true },
    appType: 'custom',
  })
  const registry = await vite.ssrLoadModule('/src/data/scripture/registry.ts')
  findApprovedChapter = registry.findApprovedChapter
})

after(async () => {
  await vite?.close()
})

const isKnownVerse = (book, chapter, verse) => {
  const chapterData = findApprovedChapter(book, chapter)
  return Boolean(chapterData?.verses.some((item) => item.verse === verse))
}

const validBackup = {
  app: LIBRARY_BACKUP_APP,
  version: 1,
  data: {
    savedVerses: [{ book: 'Psalms', chapter: 46, verse: 10 }],
    highlightedVerses: { 'Psalms|46|10': true },
    verseNotes: { 'Psalms|46|10': 'Be still and know' },
    isBookmarked: false,
    theme: 'dark',
  },
}

test('uses the real Scripture registry to accept a valid saved verse, highlight, note, and theme', () => {
  assert.equal(isKnownVerse('Psalms', 46, 10), true)
  assert.equal(validateLibraryBackup(validBackup, isKnownVerse), true)
})

test('uses the real Scripture registry to reject an impossible chapter and verse', () => {
  assert.equal(isKnownVerse('Psalms', 999, 999), false)
  assert.equal(validateLibraryBackup({
    ...validBackup,
    data: {
      ...validBackup.data,
      savedVerses: [{ book: 'Psalms', chapter: 999, verse: 999 }],
    },
  }, isKnownVerse), false)
})

test('uses the real Scripture registry to reject invalid highlight and note references', () => {
  assert.equal(validateLibraryBackup({
    ...validBackup,
    data: { ...validBackup.data, highlightedVerses: { 'Psalms|46|999': true } },
  }, isKnownVerse), false)
  assert.equal(validateLibraryBackup({
    ...validBackup,
    data: { ...validBackup.data, verseNotes: { 'Psalms|999|10': 'Invalid reference' } },
  }, isKnownVerse), false)
})
