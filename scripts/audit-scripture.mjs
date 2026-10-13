import fs from 'node:fs'
import path from 'node:path'
import { verseTextPattern } from './scripture-audit-patterns.mjs'

const root = path.resolve('src/data/scripture')

const expected = {
  genesis: 50, exodus: 40, leviticus: 27, numbers: 36, deuteronomy: 34,
  joshua: 24, judges: 21, ruth: 4, '1samuel': 31, '2samuel': 24,
  '1kings': 22, '2kings': 25, '1chronicles': 29, '2chronicles': 36,
  ezra: 10, nehemiah: 13, esther: 10, job: 42, psalms: 150, proverbs: 31,
  ecclesiastes: 12, songofsolomon: 8, isaiah: 66, jeremiah: 52,
  lamentations: 5, ezekiel: 48, daniel: 12, hosea: 14, joel: 3, amos: 9,
  obadiah: 1, jonah: 4, micah: 7, nahum: 3, habakkuk: 3, zephaniah: 3,
  haggai: 2, zechariah: 14, malachi: 4, matthew: 28, mark: 16, luke: 24,
  john: 21, acts: 28, romans: 16, '1corinthians': 16, '2corinthians': 13,
  galatians: 6, ephesians: 6, philippians: 4, colossians: 4,
  '1thessalonians': 5, '2thessalonians': 3, '1timothy': 6, '2timothy': 4,
  titus: 3, philemon: 1, hebrews: 13, james: 5, '1peter': 5, '2peter': 3,
  '1john': 5, '2john': 1, '3john': 1, jude: 1, revelation: 22,
}

const nonScriptureFiles = new Set([
  'catalog.ts', 'registry.ts', 'types.ts', 'bibleBooks.ts',
  'multiBookTest.ts', 'psalm46.ts', 'source.ts',
])
const files = fs.readdirSync(root)
  .filter((f) => f.endsWith('.ts') && !nonScriptureFiles.has(f))
  .sort()

const issues = []
let totalChapters = 0
let totalVerses = 0
const seenBooks = new Set()

for (const file of files) {
  const id = file.replace(/\.ts$/, '')
  const source = fs.readFileSync(path.join(root, file), 'utf8')

  if (!(id in expected)) {
    issues.push({ file, issue: 'UNEXPECTED SCRIPTURE FILE' })
    continue
  }

  const chapters = [...source.matchAll(/"book":\s*"([^"]+)",\s*"chapter":\s*(\d+),\s*"translation":\s*"[^"]*",\s*"verses":\s*\[([\s\S]*?)\n\s*\]/g)]

  if (chapters.length !== expected[id]) {
    issues.push({ file, issue: `chapter count ${chapters.length}, expected ${expected[id]}` })
  }

  chapters.forEach((chapterMatch, index) => {
    const chapter = Number(chapterMatch[2])
    const versesBlock = chapterMatch[3]
    seenBooks.add(id)
    totalChapters++

    if (chapter !== index + 1) {
      issues.push({ file, chapter, issue: `chapter sequence expected ${index + 1}` })
    }

    const verseMatches = [...versesBlock.matchAll(verseTextPattern)]
    const verseNumbers = verseMatches.map((match) => Number(match[1]))
    totalVerses += verseNumbers.length

    if (verseNumbers.length === 0) {
      issues.push({ file, chapter, issue: 'NO VERSES DETECTED' })
      return
    }

    const seen = new Set()
    for (const verse of verseNumbers) {
      if (seen.has(verse)) issues.push({ file, chapter, verse, issue: 'DUPLICATE VERSE' })
      seen.add(verse)
    }

    const max = Math.max(...verseNumbers)
    for (let n = 1; n <= max; n++) {
      if (!seen.has(n)) issues.push({ file, chapter, verse: n, issue: 'MISSING VERSE NUMBER' })
    }

    for (const match of verseMatches) {
      if (!match[2].trim()) {
        issues.push({ file, chapter, verse: Number(match[1]), issue: 'EMPTY VERSE TEXT' })
      }
    }
  })
}

for (const id of Object.keys(expected)) {
  if (!seenBooks.has(id)) issues.push({ file: `${id}.ts`, issue: 'NO CHAPTERS DETECTED' })
}

console.log('\n📖 PATHWAY NOTES DAILY — SCRIPTURE VERSE AUDIT')
console.log('='.repeat(52))
console.log(`Files checked : ${files.length}`)
console.log(`Books seen   : ${seenBooks.size}`)
console.log(`Chapters seen : ${totalChapters}`)
console.log(`Verses seen   : ${totalVerses}`)
console.log(`Issues found  : ${issues.length}`)
console.log('='.repeat(52))

if (issues.length) {
  console.log('⚠️ REVIEW REQUIRED')
  for (const issue of issues) console.log(JSON.stringify(issue))
  process.exitCode = 1
} else {
  console.log('✅ VERSE AUDIT PASS — no structural verse issues detected')
}
