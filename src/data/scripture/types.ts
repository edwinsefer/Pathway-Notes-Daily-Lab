export type ScriptureVerse = {
  verse: number
  text: string
}

export type ScriptureChapter = {
  book: string
  chapter: number
  translation: string
  verses: ScriptureVerse[]
}
