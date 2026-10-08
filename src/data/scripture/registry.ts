import type { ScriptureChapter } from './types'
import { acts } from './acts'
import { firstCorinthians } from './1corinthians'
import { secondCorinthians } from './2corinthians'
import { galatians } from './galatians'
import { genesisChapter1 } from './genesis'
import { john } from './john'
import { matthew } from './matthew'
import { mark } from './mark'
import { luke } from './luke'
import { philippians } from './philippians'
import { psalm46 } from './psalm46'
import { romans } from './romans'

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
  ...acts,
  ...firstCorinthians,
  ...secondCorinthians,
  ...romans,
  ...john,
  ...matthew,
  ...mark,
  ...luke,
]

export const findApprovedChapter = (bookName: string, chapterNumber: number) =>
  approvedScriptureChapters.find(
    (chapter) =>
      chapter.book.trim().toLowerCase() === bookName.trim().toLowerCase() &&
      chapter.chapter === chapterNumber,
  )
