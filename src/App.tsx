import { useEffect, useMemo, useState } from 'react'
import BlogHome from './BlogHome'
import { todaysPathway } from './data/todaysPathway'
import { psalm46 } from './data/scripture/psalm46'
import { bibleBooks } from './data/scripture/bibleBooks'
import { validateLibraryBackup, LIBRARY_BACKUP_APP } from './data/libraryBackupValidation.mjs'
import type { ScriptureChapter } from './data/scripture/types'
import { BOOK_CATALOGUE_BACKUP_MAX_BYTES, createBookCatalogueBackup, createBookRecord, loadBookCatalogue, mergeBookCatalogueRecords, parseBookCatalogueBackup, previewBookCatalogueRestore, saveBookCatalogue } from './data/bookCatalogue.mjs'
import type { BookRecord, BookFormat } from './data/bookCatalogue.mjs'

type Theme = 'light' | 'dark'
type Page = 'blog' | 'home' | 'books' | 'library' | 'search' | 'scripture' | 'bible' | 'audit'
type LibraryFilter = 'all' | 'saved' | 'highlighted' | 'noted'

type AuditIssue = {
  book: string
  chapter?: number
  verse?: number
  issue: string
}

const runScriptureAudit = (books: typeof bibleBooks, chaptersData: ScriptureChapter[]): AuditIssue[] => {
  const issues: AuditIssue[] = []

  for (const book of books) {
    const chapters = chaptersData
      .filter((chapter) => chapter.book.trim().toLowerCase() === book.name.trim().toLowerCase())
      .sort((a, b) => a.chapter - b.chapter)

    if (chapters.length !== book.chapters) {
      issues.push({ book: book.name, issue: `chapter count ${chapters.length}; expected ${book.chapters}` })
    }

    chapters.forEach((chapter, index) => {
      if (chapter.chapter !== index + 1) {
        issues.push({ book: book.name, chapter: chapter.chapter, issue: `chapter sequence expected ${index + 1}` })
      }

      if (chapter.verses.length === 0) {
        issues.push({ book: book.name, chapter: chapter.chapter, issue: 'no verses' })
        return
      }

      const seen = new Set<number>()

      for (const verse of chapter.verses) {
        if (seen.has(verse.verse)) {
          issues.push({ book: book.name, chapter: chapter.chapter, verse: verse.verse, issue: 'duplicate verse' })
        }
        seen.add(verse.verse)

        if (!verse.text.trim()) {
          issues.push({ book: book.name, chapter: chapter.chapter, verse: verse.verse, issue: 'empty verse text' })
        }
      }

      const maxVerse = Math.max(...chapter.verses.map((verse) => verse.verse))
      for (let verseNumber = 1; verseNumber <= maxVerse; verseNumber += 1) {
        if (!seen.has(verseNumber)) {
          issues.push({ book: book.name, chapter: chapter.chapter, verse: verseNumber, issue: 'missing verse number' })
        }
      }
    })
  }

  return issues
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('pathway-theme')
    return savedTheme === 'dark' ? 'dark' : 'light'
  })
  const [page, setPage] = useState<Page>('blog')
  const [scriptureRegistry, setScriptureRegistry] = useState<typeof import('./data/scripture/registry') | null>(null)
  const [scriptureDataLoading, setScriptureDataLoading] = useState(false)
  const [scriptureDataError, setScriptureDataError] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<ScriptureChapter>(psalm46)
  const [selectedVerse, setSelectedVerse] = useState(46)
  const [navigationBook, setNavigationBook] = useState('Genesis')
  const [navigationChapter, setNavigationChapter] = useState(1)
  const [navigationVerse, setNavigationVerse] = useState(1)
  const [scriptureSearch, setScriptureSearch] = useState('')
  const [savedVerses, setSavedVerses] = useState<Array<{ book: string; chapter: number; verse: number }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('pathway-saved-verses') ?? '[]')
    } catch {
      return []
    }
  })
  const [isFullPathwayOpen, setIsFullPathwayOpen] = useState(false)
  const [auditIssues, setAuditIssues] = useState<AuditIssue[] | null>(null)
  const [highlightedVerses, setHighlightedVerses] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('pathway-highlighted-verses') ?? '{}')
    } catch {
      return {}
    }
  })
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('pathway-verse-notes') ?? '{}')
    } catch {
      return {}
    }
  })

  const [isBookmarked, setIsBookmarked] = useState(() => {
    return localStorage.getItem('pathway-bookmarked') === 'true'
  })
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('all')
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryContext, setLibraryContext] = useState<string | null>(null)
  const [backupStatus, setBackupStatus] = useState('')
  const [bookCatalogue, setBookCatalogue] = useState(() => loadBookCatalogue(localStorage))
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthors, setBookAuthors] = useState('')
  const [bookFormat, setBookFormat] = useState<BookFormat>('record-only')
  const [bookLanguage, setBookLanguage] = useState('')
  const [bookCategory, setBookCategory] = useState('')
  const [bookReadingStatus, setBookReadingStatus] = useState<'to-read' | 'reading' | 'completed'>('to-read')
  const [bookSearch, setBookSearch] = useState('')
  const [bookFilter, setBookFilter] = useState('all')
  const [bookFormMessage, setBookFormMessage] = useState('')
  const [bookBackupPreview, setBookBackupPreview] = useState<ReturnType<typeof previewBookCatalogueRestore> | null>(null)
  const [bookBackupStatus, setBookBackupStatus] = useState('')

  useEffect(() => {
    if (!['bible', 'scripture', 'library', 'search', 'audit'].includes(page) || scriptureRegistry) return
    let active = true
    setScriptureDataLoading(true)
    import('./data/scripture/registry')
      .then((registry) => {
        if (active) { setScriptureRegistry(registry); setScriptureDataError(false) }
      })
      .catch(() => { if (active) setScriptureDataError(true) })
      .finally(() => { if (active) setScriptureDataLoading(false) })
    return () => { active = false }
  }, [page, scriptureRegistry])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('pathway-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('pathway-bookmarked', String(isBookmarked))
  }, [isBookmarked])

  useEffect(() => {
    localStorage.setItem('pathway-saved-verses', JSON.stringify(savedVerses))
  }, [savedVerses])

  useEffect(() => {
    localStorage.setItem('pathway-verse-notes', JSON.stringify(verseNotes))
  }, [verseNotes])

  useEffect(() => {
    localStorage.setItem('pathway-highlighted-verses', JSON.stringify(highlightedVerses))
  }, [highlightedVerses])

  const exportLibraryBackup = () => {
    const backup = {
      app: LIBRARY_BACKUP_APP,
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        savedVerses,
        highlightedVerses,
        verseNotes,
        isBookmarked,
        theme,
      },
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pathway-notes-library-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Keep the object URL alive briefly so slower mobile browsers can start the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setBackupStatus('Backup downloaded. Keep this file somewhere safe.')
  }

  const importLibraryBackup = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setBackupStatus('This backup file is larger than 10 MB. No data was changed.')
      return
    }
    try {
      const parsed = JSON.parse(await file.text())
      const isKnownVerse = (book: string, chapter: number, verse: number) => {
        const chapterData = findLoadedApprovedChapter(book, chapter)
        return Boolean(chapterData?.verses.some((item) => item.verse === verse))
      }
      if (!validateLibraryBackup(parsed, isKnownVerse)) {
        setBackupStatus('This backup file is invalid or from an unsupported version. No data was changed.')
        return
      }
      const data = parsed.data as {
        savedVerses: Array<{ book: string; chapter: number; verse: number }>
        highlightedVerses: Record<string, boolean>
        verseNotes: Record<string, string>
        isBookmarked: boolean
        theme: Theme
      }
      if (!window.confirm('Restore this backup? Current saved verses, highlights, notes, and theme on this preview will be replaced.')) {
        setBackupStatus('Restore cancelled. No data was changed.')
        return
      }
      setSavedVerses(data.savedVerses)
      setHighlightedVerses(data.highlightedVerses)
      setVerseNotes(data.verseNotes)
      setIsBookmarked(data.isBookmarked)
      setTheme(data.theme)
      setBackupStatus('Backup restored on this preview. Please verify your library.')
    } catch {
      setBackupStatus('Could not read this backup file. No data was changed.')
    }
  }

  const exportBookCatalogueBackup = () => {
    try {
      const backup = createBookCatalogueBackup(bookCatalogue.records)
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pathway-books-catalogue-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setBookBackupStatus('Books Catalogue backup downloaded. Keep this file somewhere safe.')
    } catch (error) {
      setBookBackupStatus(error instanceof Error ? error.message : 'Books Catalogue backup could not be created.')
    }
  }

  const previewBookCatalogueBackup = async (file: File | undefined) => {
    setBookBackupPreview(null)
    setBookBackupStatus('')
    if (!file) return
    if (file.size > BOOK_CATALOGUE_BACKUP_MAX_BYTES) {
      setBookBackupStatus('This backup file is larger than 10 MB. No data was changed.')
      return
    }
    try {
      const parsed = parseBookCatalogueBackup(JSON.parse(await file.text()))
      if (!parsed.valid) {
        setBookBackupStatus(`Invalid Books Catalogue backup: ${parsed.errors.join('; ')}. No data was changed.`)
        return
      }
      const preview = previewBookCatalogueRestore(bookCatalogue.records, parsed.records)
      if (!preview.valid) {
        setBookBackupStatus(`Could not preview this backup: ${preview.errors.join('; ')}. No data was changed.`)
        return
      }
      setBookBackupPreview(preview)
      setBookBackupStatus(`Backup validated. Exported at ${parsed.exportedAt}. Review the counts before restoring.`)
    } catch {
      setBookBackupStatus('Could not read this backup file. No data was changed.')
    }
  }

  const restoreBookCatalogueBackup = (mode: 'replace' | 'merge') => {
    if (!bookBackupPreview?.valid) return
    const recordsToRestore = mode === 'replace'
      ? bookBackupPreview.incomingRecords
      : mergeBookCatalogueRecords(bookCatalogue.records, bookBackupPreview.newRecords)
    if (!window.confirm(mode === 'replace'
      ? `Replace the current Books Library catalogue with the backup? Current: ${bookCatalogue.records.length}; backup: ${bookBackupPreview.incomingCount}. This affects only Books Library metadata.`
      : `Merge this backup into Books Library? Existing records will be kept. New records: ${bookBackupPreview.newRecords.length}; duplicate candidates skipped: ${bookBackupPreview.duplicateIds.length + bookBackupPreview.duplicateBooks.length}. This affects only Books Library metadata.`)) return
    const result = saveBookCatalogue(localStorage, recordsToRestore)
    if (!result.saved) {
      setBookBackupStatus(`Restore failed: ${result.errors.join('; ')}. Existing data was not changed.`)
      return
    }
    setBookCatalogue({ records: recordsToRestore, valid: true, errors: [] })
    setBookBackupPreview(null)
    setBookBackupStatus(`Books Catalogue ${mode === 'replace' ? 'replaced' : 'merged'} successfully. Please verify your book list.`)
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  const toggleBookmark = () => {
    setIsBookmarked((currentValue) => !currentValue)
  }

  const selectedVerseKey = `${selectedChapter.book}|${selectedChapter.chapter}|${selectedVerse}`
  const isSelectedVerseSaved = savedVerses.some(
    (item) => `${item.book}|${item.chapter}|${item.verse}` === selectedVerseKey,
  )

  const findLoadedApprovedChapter = (book: string, chapter: number) => scriptureRegistry?.findApprovedChapter(book, chapter) ?? null
  const approvedScriptureChapters = scriptureRegistry?.approvedScriptureChapters ?? []

  const highlightedVerseItems = useMemo(() => {
    return Object.entries(highlightedVerses)
      .filter(([, isHighlighted]) => isHighlighted)
      .map(([key]) => {
        const [book, chapterText, verseText] = key.split('|')
        const chapter = Number(chapterText)
        const verse = Number(verseText)
        const chapterData = findLoadedApprovedChapter(book, chapter)
        const verseData = chapterData?.verses.find((item) => item.verse === verse)
        return { key, book, chapter, verse, text: verseData?.text ?? 'Verse text unavailable.' }
      })
      .filter((item) => item.text !== 'Verse text unavailable.')
  }, [highlightedVerses, scriptureRegistry])

  const isSelectedVerseHighlighted = Boolean(highlightedVerses[selectedVerseKey])

  const filteredLibrarySections = {
    pathways: libraryFilter === 'all',
    saved: libraryFilter === 'all' || libraryFilter === 'saved',
    highlighted: libraryFilter === 'all' || libraryFilter === 'highlighted',
    noted: libraryFilter === 'all' || libraryFilter === 'noted',
  }

  const normalizedLibraryQuery = libraryQuery.trim().toLowerCase()
  const matchesLibraryQuery = (book: string, chapter: number, verse: number, text: string, note = '') => {
    if (!normalizedLibraryQuery) return true
    return [book, String(chapter), String(verse), `${book} ${chapter}:${verse}`, text, note]
      .join(' ')
      .toLowerCase()
      .includes(normalizedLibraryQuery)
  }

  const filteredSavedVerses = useMemo(
    () => savedVerses.filter((item) => {
      const chapter = findLoadedApprovedChapter(item.book, item.chapter)
      const verse = chapter?.verses.find((entry) => entry.verse === item.verse)
      return matchesLibraryQuery(item.book, item.chapter, item.verse, verse?.text ?? '', verseNotes[item.book + '|' + item.chapter + '|' + item.verse] ?? '')
    }),
    [savedVerses, verseNotes, normalizedLibraryQuery, scriptureRegistry],
  )

  const filteredHighlightedVerses = useMemo(
    () => highlightedVerseItems.filter((item) => matchesLibraryQuery(item.book, item.chapter, item.verse, item.text, verseNotes[item.key] ?? '')),
    [highlightedVerseItems, verseNotes, normalizedLibraryQuery],
  )

  const notedVerseItems = useMemo(() => {
    return Object.entries(verseNotes).map(([key, note]) => {
      const [book, chapterText, verseText] = key.split('|')
      const chapter = Number(chapterText)
      const verse = Number(verseText)
      const chapterData = findLoadedApprovedChapter(book, chapter)
      const verseData = chapterData?.verses.find((item) => item.verse === verse)
      return { key, book, chapter, verse, text: verseData?.text ?? '', note }
    }).filter((item) => item.note.trim() && item.text)
  }, [verseNotes, scriptureRegistry])

  const filteredNotedVerses = useMemo(
    () => notedVerseItems.filter((item) => matchesLibraryQuery(item.book, item.chapter, item.verse, item.text, item.note)),
    [notedVerseItems, normalizedLibraryQuery],
  )

  const toggleVerseHighlight = () => {
    setHighlightedVerses((current) => ({
      ...current,
      [selectedVerseKey]: !current[selectedVerseKey],
    }))
  }

  const updateVerseNote = (note: string) => {
    setVerseNotes((current) => {
      const next = { ...current }
      if (note.trim()) next[selectedVerseKey] = note
      else delete next[selectedVerseKey]
      return next
    })
  }

  const toggleSelectedVerse = () => {
    setSavedVerses((current) => {
      if (isSelectedVerseSaved) {
        return current.filter(
          (item) => `${item.book}|${item.chapter}|${item.verse}` !== selectedVerseKey,
        )
      }
      return [...current, {
        book: selectedChapter.book,
        chapter: selectedChapter.chapter,
        verse: selectedVerse,
      }]
    })
  }

  const openScripture = (chapter: ScriptureChapter, verseNumber = 1, context: string | null = null) => {
    setSelectedChapter(chapter)
    setSelectedVerse(verseNumber)
    setNavigationBook(chapter.book)
    setNavigationChapter(chapter.chapter)
    setNavigationVerse(verseNumber)
    setPage('scripture')
    setLibraryContext(context)
    setIsFullPathwayOpen(false)
    window.setTimeout(() => {
      document.getElementById(`verse-${verseNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
  }

  const openPage = (nextPage: Page) => {
    setPage(nextPage)
    setIsFullPathwayOpen(false)
    if (nextPage === 'audit' && scriptureRegistry) setAuditIssues(runScriptureAudit(bibleBooks, scriptureRegistry.approvedScriptureChapters))
  }

  useEffect(() => {
    if (page === 'audit' && scriptureRegistry) setAuditIssues(runScriptureAudit(bibleBooks, scriptureRegistry.approvedScriptureChapters))
  }, [page, scriptureRegistry])

  const openChapter = (bookName: string, chapterNumber: number) => {
    const chapter = findLoadedApprovedChapter(bookName, chapterNumber)
    if (chapter) openScripture(chapter, 1)
  }

  const navigationBookInfo = bibleBooks.find(
    (book) => book.name.trim().toLowerCase() === navigationBook.trim().toLowerCase(),
  )
  const navigationChapterNumbers = navigationBookInfo
    ? Array.from({ length: navigationBookInfo.chapters }, (_, index) => index + 1)
    : []
  const navigationChapterData = findLoadedApprovedChapter(navigationBook, navigationChapter)
  const navigationVerses = navigationChapterData?.verses ?? []

  const currentBookIndex = bibleBooks.findIndex(
    (book) => book.name.trim().toLowerCase() === selectedChapter.book.trim().toLowerCase(),
  )

  const previousChapterTarget = (() => {
    if (currentBookIndex < 0) return null
    if (selectedChapter.chapter > 1) {
      return findLoadedApprovedChapter(selectedChapter.book, selectedChapter.chapter - 1) ?? null
    }

    for (let index = currentBookIndex - 1; index >= 0; index -= 1) {
      const book = bibleBooks[index]
      const chapter = findLoadedApprovedChapter(book.name, book.chapters)
      if (chapter) return chapter
    }

    return null
  })()

  const nextChapterTarget = (() => {
    if (currentBookIndex < 0) return null
    const currentBook = bibleBooks[currentBookIndex]

    if (selectedChapter.chapter < currentBook.chapters) {
      return findLoadedApprovedChapter(selectedChapter.book, selectedChapter.chapter + 1) ?? null
    }

    for (let index = currentBookIndex + 1; index < bibleBooks.length; index += 1) {
      const book = bibleBooks[index]
      const chapter = findLoadedApprovedChapter(book.name, 1)
      if (chapter) return chapter
    }

    return null
  })()

  const scriptureSearchResults = useMemo(() => {
    const rawQuery = scriptureSearch.trim()
    const query = rawQuery.toLowerCase()
    if (!query) return []

    const results: Array<{
      book: string
      chapter: number
      verse: number
      text: string
    }> = []

    const referenceMatch = rawQuery.match(/^(.+?)\s+(\d+)(?::(\d+))?$/)

    if (referenceMatch) {
      const bookQuery = referenceMatch[1].trim().toLowerCase()
      const chapterNumber = Number(referenceMatch[2])
      const verseNumber = referenceMatch[3] ? Number(referenceMatch[3]) : null

      const chapter = approvedScriptureChapters.find(
        (item) =>
          item.book.trim().toLowerCase() === bookQuery &&
          item.chapter === chapterNumber,
      )

      if (chapter) {
        for (const verse of chapter.verses) {
          if (verseNumber === null || verse.verse === verseNumber) {
            results.push({
              book: chapter.book,
              chapter: chapter.chapter,
              verse: verse.verse,
              text: verse.text,
            })
          }
        }
      }

      return results
    }

    for (const chapter of approvedScriptureChapters) {
      for (const verse of chapter.verses) {
        if (verse.text.toLowerCase().includes(query)) {
          results.push({
            book: chapter.book,
            chapter: chapter.chapter,
            verse: verse.verse,
            text: verse.text,
          })
        }
        if (results.length >= 50) return results
      }
    }

    return results
  }, [scriptureSearch])

  return (
    <div className="site-shell">
      <header className="site-header blog-site-header">
        <div className="brand">
          <div className="brand-row">
            <button className="blog-brand-mark" type="button" onClick={() => openPage('blog')} aria-label="Pathway Notes Daily home">☀️📖</button>
            <div className="blog-brand-copy">
              <button className="brand-title blog-brand-title" type="button" onClick={() => openPage('blog')}>Pathway Notes Daily</button>
              <span className="brand-subtitle">Walk with God · Read · Reflect · Grow · Share</span>
            </div>
            <div className="blog-header-actions">
              <button className="blog-header-search" type="button" onClick={() => openPage('search')}>Search… <span aria-hidden="true">⌕</span></button>
              <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} title={theme === 'light' ? 'Dark theme' : 'Light theme'}>{theme === 'light' ? '☀️' : '🌙'}</button>
            </div>
          </div>
          <span className="blog-brand-descriptor">Edwin’s Christian Reading Experience</span>
        </div>
      </header>

      <nav className="site-nav blog-site-nav" aria-label="Main navigation">
        <button className={page === 'blog' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('blog')}>⌂ Home</button>
        <button className={page === 'home' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('home')}>Today’s Pathway</button>
        <button className={page === 'bible' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('bible')}>Bible Study</button>
        <button className="nav-link" type="button" onClick={() => openPage('home')}>Devotional</button>
        <button className="nav-link" type="button" onClick={() => openPage('home')}>Christian Living</button>
        <button className="nav-link" type="button" onClick={() => openPage('home')}>Prayer</button>
        <button className={page === 'books' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('books')}>Books Library</button>
        <button className={page === 'library' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('library')}>Personal Notes</button>
        <button className="nav-link" type="button" onClick={() => openPage('audit')}>About / Audit</button>
      </nav>

      <main className={page === 'blog' ? 'main-content blog-main-content' : 'main-content'}>
        {scriptureDataLoading && <p aria-live="polite" className="saved-empty-text">Loading Scripture library…</p>}
        {scriptureDataError && <p role="alert" className="saved-empty-text">Scripture library could not be loaded. Please try again.</p>}
        {page === 'blog' && <BlogHome onNavigate={openPage} />}
        {page === 'home' && (
          <section className="pathway-card" aria-labelledby="today-pathway-title">
            <div className="pathway-meta">
              <p className="eyebrow">{todaysPathway.label}</p>
              <span className="pathway-category">{todaysPathway.category}</span>
            </div>

            <p className="pathway-date">{todaysPathway.dateLabel}</p>

            <div className="pathway-title-row">
              <div>
                <h1 id="today-pathway-title">{todaysPathway.title}</h1>
                <p className="scripture-reference">{todaysPathway.scriptureReference}</p>
              </div>

              <button
                className={`bookmark-button${isBookmarked ? ' is-bookmarked' : ''}`}
                type="button"
                onClick={toggleBookmark}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this pathway'}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this pathway'}
              >
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
            </div>

            {todaysPathway.scriptureTranslation && (
              <p className="scripture-translation">{todaysPathway.scriptureTranslation}</p>
            )}

            {todaysPathway.scriptureText && (
              <blockquote className="scripture-text">{todaysPathway.scriptureText}</blockquote>
            )}

            <button
              className="pathway-read-button scripture-reader-button"
              type="button"
              onClick={() => openScripture(psalm46)}
            >
              Read Psalm 46
            </button>

            <div className="pathway-section">
              <h2>Reflection</h2>
              <p>{todaysPathway.reflection}</p>
            </div>

            {!isFullPathwayOpen && (
              <button
                className="pathway-read-button"
                type="button"
                onClick={() => setIsFullPathwayOpen(true)}
                aria-expanded="false"
              >
                Read Full Pathway
              </button>
            )}

            {isFullPathwayOpen && (
              <>
                <div className="pathway-section">
                  <h2>Prayer</h2>
                  <p>{todaysPathway.prayer}</p>
                </div>

                <button
                  className="pathway-read-button"
                  type="button"
                  onClick={() => setIsFullPathwayOpen(false)}
                  aria-expanded="true"
                >
                  Show Less
                </button>
              </>
            )}
          </section>
        )}

        {page === 'bible' && scriptureRegistry && (
          <section className="scripture-library-page" aria-labelledby="bible-title">
            <div className="page-heading">
              <p className="eyebrow">SCRIPTURE LIBRARY</p>
              <h1 id="bible-title">Tamil Bible</h1>
              <p>Local Scripture available in the Laboratory.</p>
            </div>

            <div className="scripture-navigator" aria-label="Scripture navigator">
              <div className="scripture-select-group">
                <label htmlFor="bible-book-select">Book</label>
                <select
                  id="bible-book-select"
                  value={navigationBook}
                  onChange={(event) => {
                    const nextBook = event.target.value
                    const chapterData = findLoadedApprovedChapter(nextBook, 1)
                    setNavigationBook(nextBook)
                    setNavigationChapter(1)
                    setNavigationVerse(chapterData?.verses[0]?.verse ?? 1)
                  }}
                >
                  {bibleBooks.map((book) => (
                    <option key={book.id} value={book.name}>{book.name}</option>
                  ))}
                </select>
              </div>

              <div className="scripture-select-group">
                <label htmlFor="bible-chapter-select">Chapter</label>
                <select
                  id="bible-chapter-select"
                  value={navigationChapter}
                  onChange={(event) => {
                    const nextChapter = Number(event.target.value)
                    const chapterData = findLoadedApprovedChapter(navigationBook, nextChapter)
                    setNavigationChapter(nextChapter)
                    setNavigationVerse(chapterData?.verses[0]?.verse ?? 1)
                  }}
                >
                  {navigationChapterNumbers.map((chapterNumber) => (
                    <option
                      key={chapterNumber}
                      value={chapterNumber}
                      disabled={!findLoadedApprovedChapter(navigationBook, chapterNumber)}
                    >
                      {chapterNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="scripture-select-group">
                <label htmlFor="bible-verse-select">Verse</label>
                <select
                  id="bible-verse-select"
                  value={navigationVerse}
                  onChange={(event) => setNavigationVerse(Number(event.target.value))}
                >
                  {navigationVerses.map((verse) => (
                    <option key={verse.verse} value={verse.verse}>{verse.verse}</option>
                  ))}
                </select>
              </div>

              <button
                className="scripture-go-button"
                type="button"
                onClick={() => navigationChapterData && openScripture(navigationChapterData, navigationVerse)}
                disabled={!navigationChapterData}
              >
                Go to Scripture
              </button>
            </div>

            <div className="pathway-section">
              <h2>Scripture Integrity</h2>
              <p>Run a local structural audit of all 66 Bible books without changing any Scripture data.</p>
              <button className="pathway-read-button" type="button" onClick={() => openPage('audit')}>
                Run Scripture Audit
              </button>
            </div>
          </section>
        )}

        {page === 'audit' && scriptureRegistry && (
          <section className="library-page" aria-labelledby="audit-title">
            <div className="page-heading">
              <p className="eyebrow">SCRIPTURE AUDIT</p>
              <h1 id="audit-title">Bible Integrity Check</h1>
              <p>Runtime audit of the local Tamil Scripture registry. No Scripture data is modified.</p>
            </div>

            <section className="saved-library-section">
              <div className="saved-library-heading">
                <h2>{auditIssues?.length ? 'Review Required' : 'Audit Passed'}</h2>
              </div>
              <p><strong>Books:</strong> {bibleBooks.length}</p>
              <p><strong>Chapters registered:</strong> {approvedScriptureChapters.length}</p>
              <p><strong>Verses scanned:</strong> {approvedScriptureChapters.reduce((total, chapter) => total + chapter.verses.length, 0)}</p>
              <p><strong>Issues found:</strong> {auditIssues?.length ?? 0}</p>

              {auditIssues?.length ? (
                <div className="search-results">
                  {auditIssues.map((issue, index) => (
                    <article className="search-result-item" key={index}>
                      <div>
                        <p className="search-result-reference">
                          {issue.book}{issue.chapter ? ` ${issue.chapter}` : ''}{issue.verse ? `:${issue.verse}` : ''}
                        </p>
                        <p className="search-result-text">{issue.issue}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="saved-empty-text">No structural verse issues detected.</p>
              )}

              <button className="pathway-read-button" type="button" onClick={() => openPage('bible')}>
                Back to Bible Library
              </button>
            </section>
          </section>
        )}

        {page === 'scripture' && scriptureRegistry && (
          <section className="scripture-reader" aria-labelledby="scripture-reader-title">
            <div className="page-heading">
              <p className="eyebrow">SCRIPTURE READER</p>
              {libraryContext && <p className="reading-context">{libraryContext}</p>}
              <h1 id="scripture-reader-title">{selectedChapter.book} {selectedChapter.chapter}</h1>
              <p>{selectedChapter.translation}</p>
            </div>

            <div className="scripture-navigator" aria-label="Scripture navigator">
              <div className="scripture-select-group">
                <label htmlFor="book-select">Book</label>
                <select
                  id="book-select"
                  value={navigationBook}
                  onChange={(event) => {
                    const nextBook = event.target.value
                    const nextChapter = 1
                    const chapterData = findLoadedApprovedChapter(nextBook, nextChapter)
                    setNavigationBook(nextBook)
                    setNavigationChapter(nextChapter)
                    setNavigationVerse(chapterData?.verses[0]?.verse ?? 1)
                  }}
                >
                  {bibleBooks.map((book) => (
                    <option key={book.id} value={book.name}>{book.name}</option>
                  ))}
                </select>
              </div>

              <div className="scripture-select-group">
                <label htmlFor="chapter-select">Chapter</label>
                <select
                  id="chapter-select"
                  value={navigationChapter}
                  onChange={(event) => {
                    const nextChapter = Number(event.target.value)
                    const chapterData = findLoadedApprovedChapter(navigationBook, nextChapter)
                    setNavigationChapter(nextChapter)
                    setNavigationVerse(chapterData?.verses[0]?.verse ?? 1)
                  }}
                >
                  {navigationChapterNumbers.map((chapterNumber) => (
                    <option key={chapterNumber} value={chapterNumber} disabled={!findLoadedApprovedChapter(navigationBook, chapterNumber)}>
                      {chapterNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="scripture-select-group">
                <label htmlFor="verse-select">Verse</label>
                <select
                  id="verse-select"
                  value={navigationVerse}
                  onChange={(event) => setNavigationVerse(Number(event.target.value))}
                >
                  {navigationVerses.map((verse) => (
                    <option key={verse.verse} value={verse.verse}>{verse.verse}</option>
                  ))}
                </select>
              </div>

              <button
                className="scripture-go-button"
                type="button"
                onClick={() => navigationChapterData && openScripture(navigationChapterData, navigationVerse)}
                disabled={!navigationChapterData}
              >
                Go to Scripture
              </button>

              <button
                className={`scripture-save-button${isSelectedVerseSaved ? ' is-saved' : ''}`}
                type="button"
                onClick={toggleSelectedVerse}
                aria-pressed={isSelectedVerseSaved}
              >
                {isSelectedVerseSaved ? 'Saved Verse ✓' : 'Save Verse'}
              </button>

              <button
                className={`scripture-highlight-button${isSelectedVerseHighlighted ? ' is-highlighted' : ''}`}
                type="button"
                onClick={toggleVerseHighlight}
                aria-pressed={isSelectedVerseHighlighted}
              >
                {isSelectedVerseHighlighted ? 'Highlighted ✓' : 'Highlight Verse'}
              </button>
            </div>

            <div className="verse-note-card">
              <label htmlFor="verse-note">Personal note for {selectedChapter.book} {selectedChapter.chapter}:{selectedVerse}</label>
              <textarea
                id="verse-note"
                value={verseNotes[selectedVerseKey] ?? ''}
                onChange={(event) => updateVerseNote(event.target.value)}
                placeholder="Write your personal reflection or note…"
                rows={4}
              />
              <p className="verse-note-help">Your note is stored on this device. It does not change the Bible text.</p>
            </div>

            <div className="scripture-chapter">
              {selectedChapter.verses.map((verse) => (
                <p
                  className={`scripture-verse${selectedVerse === verse.verse ? ' selected' : ''}${highlightedVerses[selectedChapter.book + '|' + selectedChapter.chapter + '|' + verse.verse] ? ' highlighted' : ''}`}
                  id={`verse-${verse.verse}`}
                  key={verse.verse}
                >
                  <span className="verse-number">{verse.verse}</span>
                  <span>{verse.text}</span>
                </p>
              ))}
            </div>

            <div className="chapter-navigation" aria-label="Chapter navigation">
              <button
                className="chapter-navigation-button"
                type="button"
                onClick={() => previousChapterTarget && openScripture(previousChapterTarget, 1)}
                disabled={!previousChapterTarget}
              >
                ← Previous Chapter
              </button>

              <div className="chapter-navigation-label">
                <span>{selectedChapter.book}</span>
                <strong>{selectedChapter.chapter}</strong>
                {libraryContext && <small>Reading from your Library</small>}
              </div>

              <button
                className="chapter-navigation-button"
                type="button"
                onClick={() => nextChapterTarget && openScripture(nextChapterTarget, 1)}
                disabled={!nextChapterTarget}
              >
                Next Chapter →
              </button>
            </div>

            <button className="pathway-read-button" type="button" onClick={() => openPage('bible')}>
              Back to Bible Library
            </button>
          </section>
        )}

        {page === 'books' && (
          <section className="books-library-page" aria-labelledby="books-library-title">
            <div className="page-heading">
              <p className="eyebrow">CHRISTIAN BOOKS CATALOGUE</p>
              <h1 id="books-library-title">Books Library</h1>
              <p>A dedicated catalogue for Christian books. This stores book details only; it does not copy, move, upload, or delete files.</p>
            </div>
            <form className="books-record-form" onSubmit={(event) => {
              event.preventDefault()
              try {
                const record = createBookRecord({
                  title: bookTitle,
                  authors: bookAuthors.split(',').map((author) => author.trim()).filter(Boolean),
                  format: bookFormat,
                  language: bookLanguage.trim(),
                  category: bookCategory.trim(),
                  readingStatus: bookReadingStatus,
                })
                const nextRecords = [...bookCatalogue.records, record]
                const result = saveBookCatalogue(localStorage, nextRecords)
                if (!result.saved) {
                  setBookFormMessage(result.errors.join('; '))
                  return
                }
                setBookCatalogue({ records: nextRecords, valid: true, errors: [] })
                setBookTitle('')
                setBookAuthors('')
                setBookFormat('record-only')
                setBookLanguage('')
                setBookCategory('')
                setBookReadingStatus('to-read')
                setBookFormMessage('Book record saved on this device.')
              } catch (error) {
                setBookFormMessage(error instanceof Error ? error.message : 'Book record could not be created.')
              }
            }}>
              <h2>Record a Book</h2>
              <label>Book title *
                <input required value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} placeholder="Enter book title" />
              </label>
              <label>Author(s)
                <input value={bookAuthors} onChange={(event) => setBookAuthors(event.target.value)} placeholder="Separate multiple authors with commas" />
              </label>
              <label>Format
                <select value={bookFormat} onChange={(event) => setBookFormat(event.target.value as BookFormat)}>
                  <option value="record-only">Record only</option>
                  <option value="pdf">PDF record</option>
                  <option value="epub">EPUB record</option>
                </select>
              </label>
              <label>Language
                <input value={bookLanguage} onChange={(event) => setBookLanguage(event.target.value)} placeholder="e.g. English, Tamil" />
              </label>
              <label>Category
                <input value={bookCategory} onChange={(event) => setBookCategory(event.target.value)} placeholder="e.g. Bible Study, Theology, Devotional" />
              </label>
              <label>Reading status
                <select value={bookReadingStatus} onChange={(event) => setBookReadingStatus(event.target.value as 'to-read' | 'reading' | 'completed')}>
                  <option value="to-read">To read</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <button className="pathway-read-button" type="submit" disabled={!bookCatalogue.valid}>Save Book Record</button>
              {bookFormMessage && <p role="status">{bookFormMessage}</p>}
              {!bookCatalogue.valid && <p role="alert">Existing catalogue data needs review before new records can be saved. It has not been changed.</p>}
            </form>
            <section className="books-catalogue-list" aria-labelledby="books-catalogue-list-title">
              <h2 id="books-catalogue-list-title">Your Books ({bookCatalogue.records.length})</h2>
              <div className="books-catalogue-controls">
                <label>Search books
                  <input value={bookSearch} onChange={(event) => setBookSearch(event.target.value)} placeholder="Search title or author" />
                </label>
                <label>Filter by format
                  <select value={bookFilter} onChange={(event) => setBookFilter(event.target.value)}>
                    <option value="all">All formats</option>
                    <option value="record-only">Record only</option>
                    <option value="pdf">PDF</option>
                    <option value="epub">EPUB</option>
                  </select>
                </label>
              </div>
              {bookCatalogue.records.filter((record) => {
                const query = bookSearch.trim().toLowerCase()
                const matchesQuery = !query || record.title.toLowerCase().includes(query) || record.authors.some((author) => author.toLowerCase().includes(query))
                return matchesQuery && (bookFilter === 'all' || record.format === bookFilter)
              }).map((record) => (
                <article className="books-catalogue-card" key={record.id}>
                  <h3>{record.title}</h3>
                  <p>{record.authors.length ? record.authors.join(', ') : 'Author not recorded'}</p>
                  {record.category && <p>Category: {record.category}</p>}
                  {record.language && <p>Language: {record.language}</p>}
                  <span>{record.format.toUpperCase()} · {record.readingStatus.replace('-', ' ')}</span>
                </article>
              ))}
              {bookCatalogue.records.length === 0 && <p className="saved-empty-text">No books recorded yet. Add your first book above.</p>}
              {bookCatalogue.records.length > 0 && bookCatalogue.records.filter((record) => {
                const query = bookSearch.trim().toLowerCase()
                return (!query || record.title.toLowerCase().includes(query) || record.authors.some((author) => author.toLowerCase().includes(query))) && (bookFilter === 'all' || record.format === bookFilter)
              }).length === 0 && <p className="saved-empty-text">No books match this search or filter.</p>}
            </section>
            <section className="books-catalogue-list" aria-labelledby="books-backup-title">
              <h2 id="books-backup-title">Books Catalogue Backup</h2>
              <p className="saved-empty-text">Export or restore Books Library metadata only. PDF/EPUB file contents are never included. Personal Notes and Bible Scripture data are not affected.</p>
              <div className="library-backup-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="library-open-button" type="button" onClick={exportBookCatalogueBackup} disabled={!bookCatalogue.valid}>Download Books Backup</button>
                <label className="library-open-button" htmlFor="books-backup-file">Preview Restore</label>
                <input id="books-backup-file" type="file" accept="application/json,.json" onChange={(event) => {
                  void previewBookCatalogueBackup(event.target.files?.[0])
                  event.currentTarget.value = ''
                }} />
              </div>
              {bookBackupStatus && <p role="status">{bookBackupStatus}</p>}
              {bookBackupPreview?.valid && (
                <div className="books-backup-preview" aria-label="Books backup preview">
                  <h3>Restore Preview</h3>
                  <p>Current records: {bookBackupPreview.existingCount}</p>
                  <p>Backup records: {bookBackupPreview.incomingCount}</p>
                  <p>Duplicate IDs: {bookBackupPreview.duplicateIds.length}</p>
                  <p>Matching title and author: {bookBackupPreview.duplicateBooks.length}</p>
                  <p>New records for merge: {bookBackupPreview.newRecords.length}</p>
                  {bookBackupPreview.duplicateBooks.length > 0 && (
                    <ul>{bookBackupPreview.duplicateBooks.map((record) => <li key={record.id}>{record.title} — {record.authors.join(', ') || 'Author not recorded'}</li>)}</ul>
                  )}
                  <div className="library-backup-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="library-open-button" type="button" onClick={() => restoreBookCatalogueBackup('merge')}>Merge New Records</button>
                    <button className="library-open-button" type="button" onClick={() => restoreBookCatalogueBackup('replace')}>Replace Catalogue</button>
                    <button className="library-open-button" type="button" onClick={() => { setBookBackupPreview(null); setBookBackupStatus('Restore preview dismissed. No data was changed.') }}>Cancel Preview</button>
                  </div>
                </div>
              )}
            </section>
          </section>
        )}

        {page === 'library' && scriptureRegistry && (
          <section className="library-page" aria-labelledby="library-title">
            <div className="page-heading">
              <p className="eyebrow">PERSONAL NOTES</p>
              <h1 id="library-title">Personal Notes</h1>
              <p>Your saved pathways, verses, highlights, and notes stay on this device for now.</p>
            </div>

            <div className="library-filter-bar" aria-label="Personal Notes filter">
              {([
                ['all', 'All', savedVerses.length + highlightedVerseItems.length + notedVerseItems.length],
                ['saved', 'Saved', savedVerses.length],
                ['highlighted', 'Highlighted', highlightedVerseItems.length],
                ['noted', 'Noted', notedVerseItems.length],
              ] as const).map(([value, label, count]) => (
                <button key={value} className={libraryFilter === value ? 'library-filter active' : 'library-filter'} type="button" onClick={() => setLibraryFilter(value)} aria-pressed={libraryFilter === value}>
                  <span>{label}</span><span className="library-filter-count">{count}</span>
                </button>
              ))}
            </div>

            <div className="library-search-card">
              <label htmlFor="library-search">Find in your notes and saved items</label>
              <input
                id="library-search"
                type="search"
                value={libraryQuery}
                onChange={(event) => setLibraryQuery(event.target.value)}
                placeholder="Verse, pathway, word, or note…"
                autoComplete="off"
              />
            </div>

            <section className="saved-library-section" aria-labelledby="library-backup-title">
              <div className="saved-library-heading"><h2 id="library-backup-title">Personal Notes Backup</h2></div>
              <p className="saved-empty-text">Export your saved verses, highlights, notes, and theme to a JSON file. Import a backup to restore them on this preview.</p>
              <div className="library-backup-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="library-open-button" type="button" onClick={exportLibraryBackup}>Download Backup</button>
                <label className="library-open-button" htmlFor="library-backup-file">Restore Backup</label>
                <input
                  id="library-backup-file"
                  type="file"
                  accept="application/json,.json"
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    void importLibraryBackup(event.target.files?.[0])
                    event.currentTarget.value = ''
                  }}
                />
              </div>
              {backupStatus && <p role="status" className="search-result-note">{backupStatus}</p>}
            </section>

            {filteredLibrarySections.pathways && (
              <section className="saved-library-section" aria-labelledby="saved-pathways-title">
                <div className="saved-library-heading"><h2 id="saved-pathways-title">Saved Pathways</h2></div>
                {isBookmarked ? (
                  <article className="library-item">
                    <div><span className="pathway-category">{todaysPathway.category}</span><p className="pathway-date">{todaysPathway.dateLabel}</p><h3>{todaysPathway.title}</h3><p className="scripture-reference">{todaysPathway.scriptureReference}</p></div>
                    <button className="library-open-button" type="button" onClick={() => openPage('home')}>Open Pathway</button>
                  </article>
                ) : <p className="saved-empty-text">Nothing saved yet. Use Save on today’s pathway to keep it here.</p>}
              </section>
            )}

            {filteredLibrarySections.highlighted && (
              <section className="saved-library-section" aria-labelledby="highlighted-verses-title">
                <div className="saved-library-heading"><h2 id="highlighted-verses-title">Highlighted Verses</h2></div>
                {filteredHighlightedVerses.length > 0 ? <div className="saved-verse-list">{filteredHighlightedVerses.map((item) => {
                  const chapter = findLoadedApprovedChapter(item.book, item.chapter)
                  const verse = chapter?.verses.find((entry) => entry.verse === item.verse)
                  return <article className="library-item saved-verse-item" key={item.key}>
                    <div><p className="search-result-reference">{item.book} {item.chapter}:{item.verse}</p><p className="search-result-text">{item.text}</p>{verseNotes[item.key] && <p className="saved-verse-note"><strong>My note:</strong> {verseNotes[item.key]}</p>}</div>
                    <button className="library-open-button" type="button" onClick={() => chapter && openScripture(chapter, item.verse, 'Opened from Highlighted Verses')} disabled={!chapter || !verse}>Open Verse</button>
                  </article>
                })}</div> : <p className="saved-empty-text">No highlighted verses yet. Highlight a verse in the Scripture Reader to collect it here.</p>}
              </section>
            )}

            {filteredLibrarySections.saved && (
              <section className="saved-library-section" aria-labelledby="saved-verses-title">
                <div className="saved-library-heading"><h2 id="saved-verses-title">Saved Verses</h2></div>
                {filteredSavedVerses.length > 0 ? <div className="saved-verse-list">{filteredSavedVerses.map((item) => {
                  const chapter = findLoadedApprovedChapter(item.book, item.chapter)
                  const verse = chapter?.verses.find((entry) => entry.verse === item.verse)
                  const key = item.book + '|' + item.chapter + '|' + item.verse
                  return <article className="library-item saved-verse-item" key={key}>
                    <div><p className="search-result-reference">{item.book} {item.chapter}:{item.verse}</p><p className="search-result-text">{verse?.text ?? 'Verse text unavailable.'}</p>{verseNotes[key] && <p className="saved-verse-note"><strong>My note:</strong> {verseNotes[key]}</p>}</div>
                    <button className="library-open-button" type="button" onClick={() => chapter && openScripture(chapter, item.verse, 'Opened from Saved Verses')} disabled={!chapter || !verse}>Open Verse</button>
                  </article>
                })}</div> : <p className="saved-empty-text">No saved verses yet. Save a verse from the Scripture Reader to build your personal library.</p>}
              </section>
            )}

            {filteredLibrarySections.noted && (
              <section className="saved-library-section" aria-labelledby="noted-verses-title">
                <div className="saved-library-heading"><h2 id="noted-verses-title">My Notes</h2></div>
                {filteredNotedVerses.length > 0 ? <div className="saved-verse-list">{filteredNotedVerses.map((item) => {
                  const chapter = findLoadedApprovedChapter(item.book, item.chapter)
                  return <article className="library-item saved-verse-item" key={item.key}>
                    <div><p className="search-result-reference">{item.book} {item.chapter}:{item.verse}</p><p className="search-result-text">{item.text}</p><p className="saved-verse-note"><strong>My note:</strong> {item.note}</p></div>
                    <button className="library-open-button" type="button" onClick={() => chapter && openScripture(chapter, item.verse, 'Opened from My Notes')} disabled={!chapter}>Open Verse</button>
                  </article>
                })}</div> : <p className="saved-empty-text">No notes yet. Add a personal note from the Scripture Reader.</p>}
              </section>
            )}
          </section>
        )}

        {page === 'search' && scriptureRegistry && (
          <section className="search-page" aria-labelledby="search-title">
            <div className="page-heading">
              <p className="eyebrow">SCRIPTURE SEARCH</p>
              <h1 id="search-title">Search the Bible</h1>
              <p>Search the local Tamil Scripture text available in the Laboratory.</p>
            </div>

            <div className="search-card">
              <label htmlFor="scripture-search">Search words or phrases</label>
              <input
                id="scripture-search"
                type="search"
                value={scriptureSearch}
                onChange={(event) => setScriptureSearch(event.target.value)}
                placeholder="Type a word or phrase…"
                autoComplete="off"
              />
            </div>

            {scriptureSearch.trim() && (
              <div className="search-results" aria-live="polite">
                <p className="search-result-count">
                  {scriptureSearchResults.length} {scriptureSearchResults.length === 1 ? 'result' : 'results'} shown
                </p>

                {scriptureSearchResults.map((result) => {
                  const chapter = findLoadedApprovedChapter(result.book, result.chapter)
                  return (
                    <article className="search-result-item" key={result.book + '-' + result.chapter + '-' + result.verse}>
                      <div>
                        <p className="search-result-reference">{result.book} {result.chapter}:{result.verse}</p>
                        <p className="search-result-text">{result.text}</p>
                      </div>
                      <button
                        className="library-open-button"
                        type="button"
                        onClick={() => chapter && openScripture(chapter, result.verse)}
                        disabled={!chapter}
                      >
                        Open Verse
                      </button>
                    </article>
                  )
                })}

                {scriptureSearchResults.length === 0 && (
                  <div className="empty-library">
                    <h2>No matches found</h2>
                    <p>Try another word or phrase.</p>
                  </div>
                )}

                {scriptureSearchResults.length >= 50 && (
                  <p className="search-result-note">Showing the first 50 matches.</p>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {page !== 'blog' && (
        <footer className="site-footer blog-global-footer">
          <span>Pathway Notes Daily · Create Once. Inspire Everywhere.</span>
          <span>© 2026 Edwin’s Pathway Notes Daily</span>
        </footer>
      )}
    </div>
  )
}

export default App
