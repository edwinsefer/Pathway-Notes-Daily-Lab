import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const keys = {
  bookmark: 'pathway-bookmarked',
  saved: 'pathway-saved-verses',
  highlights: 'pathway-highlighted-verses',
  notes: 'pathway-verse-notes',
  theme: 'pathway-theme',
}
const seed = {
  savedVerses: [{ book: 'Psalms', chapter: 46, verse: 10 }],
  highlightedVerses: { 'Psalms|46|10': true },
  verseNotes: { 'Psalms|46|10': 'E2E restore note — God is Good Always' },
  isBookmarked: true,
  theme: 'dark',
}
async function seedStorage(page) {
  await page.addInitScript(({ keys, seed }) => {
    // Seed once per browser tab. Reloads must not repopulate localStorage after
    // the export test deliberately clears it to simulate a fresh library.
    if (sessionStorage.getItem('__pathway_e2e_seeded') === 'true') return
    localStorage.setItem(keys.bookmark, String(seed.isBookmarked))
    localStorage.setItem(keys.saved, JSON.stringify(seed.savedVerses))
    localStorage.setItem(keys.highlights, JSON.stringify(seed.highlightedVerses))
    localStorage.setItem(keys.notes, JSON.stringify(seed.verseNotes))
    localStorage.setItem(keys.theme, seed.theme)
    sessionStorage.setItem('__pathway_e2e_seeded', 'true')
  }, { keys, seed })
}
async function storageState(page) {
  return page.evaluate((keys) => ({
    bookmark: localStorage.getItem(keys.bookmark),
    saved: localStorage.getItem(keys.saved),
    highlights: localStorage.getItem(keys.highlights),
    notes: localStorage.getItem(keys.notes),
    theme: localStorage.getItem(keys.theme),
  }), keys)
}
async function openLibrary(page) {
  await page.getByRole('button', { name: 'Library', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Library Backup' })).toBeVisible()
}

test('browser downloads a complete backup, restores it in fresh state, and persists after reload', async ({ page }) => {
  await seedStorage(page)
  await page.goto('/')
  await openLibrary(page)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download Backup' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^pathway-notes-library-backup-\d{4}-\d{2}-\d{2}\.json$/)
  const path = await download.path()
  expect(path).toBeTruthy()

  const exported = JSON.parse(await readFile(path, 'utf8'))
  expect(exported.app).toBe('Pathway Notes Daily — Creative Laboratory')
  expect(exported.version).toBe(1)
  expect(exported.data.savedVerses).toEqual(seed.savedVerses)
  expect(exported.data.highlightedVerses).toEqual(seed.highlightedVerses)
  expect(exported.data.verseNotes).toEqual(seed.verseNotes)
  expect(exported.data.isBookmarked).toBe(true)
  expect(exported.data.theme).toBe('dark')

  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await openLibrary(page)
  page.once('dialog', dialog => dialog.accept())
  await page.locator('#library-backup-file').setInputFiles(path)

  await expect(page.getByRole('status')).toContainText('Backup restored on this preview.')
  await expect(page.getByRole('button', { name: /Saved\s*1/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Highlighted\s*1/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Noted\s*1/ })).toBeVisible()

  const restored = await storageState(page)
  expect(restored.bookmark).toBe('true')
  expect(JSON.parse(restored.saved)).toEqual(seed.savedVerses)
  expect(JSON.parse(restored.highlights)).toEqual(seed.highlightedVerses)
  expect(JSON.parse(restored.notes)).toEqual(seed.verseNotes)
  expect(restored.theme).toBe('dark')

  await page.reload()
  await openLibrary(page)
  await expect(page.getByText('E2E restore note — God is Good Always').first()).toBeVisible()
  expect(await storageState(page)).toEqual(restored)
})

test('invalid verse-reference backup is rejected without changing existing browser data', async ({ page }) => {
  await seedStorage(page)
  await page.goto('/')
  await openLibrary(page)
  const before = await storageState(page)
  const invalid = {
    app: 'Pathway Notes Daily — Creative Laboratory',
    version: 1,
    data: {
      savedVerses: [{ book: 'Psalms', chapter: 999, verse: 999 }],
      highlightedVerses: {},
      verseNotes: {},
      isBookmarked: false,
      theme: 'light',
    },
  }
  await page.locator('#library-backup-file').setInputFiles({
    name: 'invalid-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(invalid)),
  })
  await expect(page.getByRole('status')).toContainText('This backup file is invalid or from an unsupported version. No data was changed.')
  expect(await storageState(page)).toEqual(before)
  await expect(page.getByRole('heading', { name: 'Saved Items' })).toBeVisible()
})
