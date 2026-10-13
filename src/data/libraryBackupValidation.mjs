export const LIBRARY_BACKUP_APP = 'Pathway Notes Daily — Creative Laboratory'

export function validateLibraryBackup(parsed, isKnownVerse) {
  const data = parsed?.data
  const isValidVerseKey = (key) => {
    const parts = key.split('|')
    if (parts.length !== 3 || !parts[0].trim() || !/^\\d+$/.test(parts[1]) || !/^\\d+$/.test(parts[2])) return false
    const chapter = Number(parts[1])
    const verse = Number(parts[2])
    return Number.isSafeInteger(chapter) && chapter > 0 && Number.isSafeInteger(verse) && verse > 0 && isKnownVerse(parts[0], chapter, verse)
  }
  const validSaved = Array.isArray(data?.savedVerses) && data.savedVerses.every((item) =>
    item && typeof item.book === 'string' && item.book.trim().length > 0 &&
    Number.isSafeInteger(item.chapter) && item.chapter > 0 && Number.isSafeInteger(item.verse) && item.verse > 0 &&
    isKnownVerse(item.book, item.chapter, item.verse))
  const validHighlights = data?.highlightedVerses && typeof data.highlightedVerses === 'object' && !Array.isArray(data.highlightedVerses) &&
    Object.entries(data.highlightedVerses).every(([key, value]) => isValidVerseKey(key) && typeof value === 'boolean')
  const validNotes = data?.verseNotes && typeof data.verseNotes === 'object' && !Array.isArray(data.verseNotes) &&
    Object.entries(data.verseNotes).every(([key, value]) => isValidVerseKey(key) && typeof value === 'string')
  return parsed?.app === LIBRARY_BACKUP_APP && parsed?.version === 1 && validSaved && validHighlights && validNotes &&
    typeof data.isBookmarked === 'boolean' && ['light', 'dark'].includes(data.theme)
}
