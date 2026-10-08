import type { ScriptureChapter } from './types'
import { genesisChapter1 } from './genesis'
import { john } from './john'
import { philippians } from './philippians'
import { psalm46 } from './psalm46'

const genesisChapter1Data: ScriptureChapter = {
  book: 'Genesis',
  chapter: 1,
  translation: 'Tamil Old Version (1957)',
  verses: genesisChapter1,
}

/**
 * Canonical local Scripture data currently approved for the Laboratory.
 * Temporary test fixtures are intentionally excluded.
 */
export const approvedScriptureChapters: ScriptureChapter[] = [
  psalm46,
  genesisChapter1Data,
  ...philippians,
  ...john,
]

export const findApprovedChapter = (bookName: string, chapterNumber: number) =>
  approvedScriptureChapters.find(
    (chapter) =>
      chapter.book.trim().toLowerCase() === bookName.trim().toLowerCase() &&
      chapter.chapter === chapterNumber,
  )
