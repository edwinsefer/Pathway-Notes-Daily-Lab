import type { ScriptureChapter } from './types'
import { genesis } from './genesis'
import { exodus } from './exodus'
import { leviticus } from './leviticus'
import { numbers } from './numbers'
import { deuteronomy } from './deuteronomy'
import { joshua } from './joshua'
import { judges } from './judges'
import { ruth } from './ruth'
import { firstSamuel } from './1samuel'
import { secondSamuel } from './2samuel'
import { firstKings } from './1kings'
import { secondKings } from './2kings'
import { firstChronicles } from './1chronicles'
import { secondChronicles } from './2chronicles'
import { ezra } from './ezra'
import { nehemiah } from './nehemiah'
import { esther } from './esther'
import { job } from './job'
import { psalms } from './psalms'
import { proverbs } from './proverbs'
import { ecclesiastes } from './ecclesiastes'
import { songOfSolomon } from './songofsolomon'
import { isaiah } from './isaiah'
import { jeremiah } from './jeremiah'
import { lamentations } from './lamentations'
import { ezekiel } from './ezekiel'
import { daniel } from './daniel'
import { hosea } from './hosea'
import { joel } from './joel'
import { amos } from './amos'
import { obadiah } from './obadiah'
import { jonah } from './jonah'
import { micah } from './micah'
import { nahum } from './nahum'
import { habakkuk } from './habakkuk'
import { zephaniah } from './zephaniah'
import { haggai } from './haggai'
import { zechariah } from './zechariah'
import { malachi } from './malachi'
import { matthew } from './matthew'
import { mark } from './mark'
import { luke } from './luke'
import { john } from './john'
import { acts } from './acts'
import { romans } from './romans'
import { firstCorinthians } from './1corinthians'
import { secondCorinthians } from './2corinthians'
import { galatians } from './galatians'
import { ephesians } from './ephesians'
import { philippians } from './philippians'
import { colossians } from './colossians'
import { firstThessalonians } from './1thessalonians'
import { secondThessalonians } from './2thessalonians'
import { firstTimothy } from './1timothy'
import { secondTimothy } from './2timothy'
import { titus } from './titus'
import { philemon } from './philemon'
import { hebrews } from './hebrews'
import { james } from './james'
import { firstPeter } from './1peter'
import { secondPeter } from './2peter'
import { firstJohn } from './1john'
import { secondJohn } from './2john'
import { thirdJohn } from './3john'
import { jude } from './jude'
import { revelation } from './revelation'

/**
 * Canonical Tamil Old Version (1957) Scripture data for all 66 Bible books.
 * Data source: TFBF Bible-Tamil-Sathiyavedam-1957.
 */
export const approvedScriptureChapters: ScriptureChapter[] = [
  ...genesis,
  ...exodus,
  ...leviticus,
  ...numbers,
  ...deuteronomy,
  ...joshua,
  ...judges,
  ...ruth,
  ...firstSamuel,
  ...secondSamuel,
  ...firstKings,
  ...secondKings,
  ...firstChronicles,
  ...secondChronicles,
  ...ezra,
  ...nehemiah,
  ...esther,
  ...job,
  ...psalms,
  ...proverbs,
  ...ecclesiastes,
  ...songOfSolomon,
  ...isaiah,
  ...jeremiah,
  ...lamentations,
  ...ezekiel,
  ...daniel,
  ...hosea,
  ...joel,
  ...amos,
  ...obadiah,
  ...jonah,
  ...micah,
  ...nahum,
  ...habakkuk,
  ...zephaniah,
  ...haggai,
  ...zechariah,
  ...malachi,
  ...matthew,
  ...mark,
  ...luke,
  ...john,
  ...acts,
  ...romans,
  ...firstCorinthians,
  ...secondCorinthians,
  ...galatians,
  ...ephesians,
  ...philippians,
  ...colossians,
  ...firstThessalonians,
  ...secondThessalonians,
  ...firstTimothy,
  ...secondTimothy,
  ...titus,
  ...philemon,
  ...hebrews,
  ...james,
  ...firstPeter,
  ...secondPeter,
  ...firstJohn,
  ...secondJohn,
  ...thirdJohn,
  ...jude,
  ...revelation,
]

export const findApprovedChapter = (bookName: string, chapterNumber: number) =>
  approvedScriptureChapters.find(
    (chapter) =>
      chapter.book.trim().toLowerCase() === bookName.trim().toLowerCase() &&
      chapter.chapter === chapterNumber,
  )
