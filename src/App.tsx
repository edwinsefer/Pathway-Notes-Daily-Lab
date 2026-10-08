import { useEffect, useMemo, useState } from 'react'
import { todaysPathway } from './data/todaysPathway'
import { psalm46 } from './data/scripture/psalm46'
import { bibleBooks } from './data/scripture/bibleBooks'
import { approvedScriptureChapters, findApprovedChapter } from './data/scripture/registry'
import type { ScriptureChapter } from './data/scripture/types'

type Theme = 'light' | 'dark'
type Page = 'home' | 'library' | 'search' | 'scripture' | 'bible' | 'audit'

type AuditIssue = {
  book: string
  chapter?: number
  verse?: number
  issue: string
}

const runScriptureAudit = (): AuditIssue[] => {
  const issues: AuditIssue[] = []

  for (const book of bibleBooks) {
    const chapters = approvedScriptureChapters
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
  const [page, setPage] = useState<Page>('home')
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

  const isSelectedVerseHighlighted = Boolean(highlightedVerses[selectedVerseKey])

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

  const openScripture = (chapter: ScriptureChapter, verseNumber = 1) => {
    setSelectedChapter(chapter)
    setSelectedVerse(verseNumber)
    setNavigationBook(chapter.book)
    setNavigationChapter(chapter.chapter)
    setNavigationVerse(verseNumber)
    setPage('scripture')
    setIsFullPathwayOpen(false)
    window.setTimeout(() => {
      document.getElementById(`verse-${verseNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
  }

  const openPage = (nextPage: Page) => {
    setPage(nextPage)
    setIsFullPathwayOpen(false)
    if (nextPage === 'audit') setAuditIssues(runScriptureAudit())
  }

  const openChapter = (bookName: string, chapterNumber: number) => {
    const chapter = findApprovedChapter(bookName, chapterNumber)
    if (chapter) openScripture(chapter, 1)
  }

  const availableChapters = approvedScriptureChapters
  const navigationBookInfo = bibleBooks.find(
    (book) => book.name.trim().toLowerCase() === navigationBook.trim().toLowerCase(),
  )
  const navigationChapterNumbers = navigationBookInfo
    ? Array.from({ length: navigationBookInfo.chapters }, (_, index) => index + 1)
    : []
  const navigationChapterData = findApprovedChapter(navigationBook, navigationChapter)
  const navigationVerses = navigationChapterData?.verses ?? []

  const currentBookIndex = bibleBooks.findIndex(
    (book) => book.name.trim().toLowerCase() === selectedChapter.book.trim().toLowerCase(),
  )

  const previousChapterTarget = (() => {
    if (currentBookIndex < 0) return null
    if (selectedChapter.chapter > 1) {
      return findApprovedChapter(selectedChapter.book, selectedChapter.chapter - 1) ?? null
    }

    for (let index = currentBookIndex - 1; index >= 0; index -= 1) {
      const book = bibleBooks[index]
      const chapter = findApprovedChapter(book.name, book.chapters)
      if (chapter) return chapter
    }

    return null
  })()

  const nextChapterTarget = (() => {
    if (currentBookIndex < 0) return null
    const currentBook = bibleBooks[currentBookIndex]

    if (selectedChapter.chapter < currentBook.chapters) {
      return findApprovedChapter(selectedChapter.book, selectedChapter.chapter + 1) ?? null
    }

    for (let index = currentBookIndex + 1; index < bibleBooks.length; index += 1) {
      const book = bibleBooks[index]
      const chapter = findApprovedChapter(book.name, 1)
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
      <header className="site-header">
        <div className="brand">
          <div className="brand-row">
            <div>
              <span className="brand-title">Pathway Notes Daily</span>
              <span className="brand-subtitle">Creative Laboratory</span>
            </div>

            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              title={theme === 'light' ? 'Dark theme' : 'Light theme'}
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </header>

      <nav className="site-nav" aria-label="Main navigation">
        <button className={page === 'bible' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('bible')}>
          Bible
        </button>
        <button className={page === 'home' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('home')}>
          Home
        </button>
        <button className={page === 'library' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('library')}>
          Library
        </button>
        <button className={page === 'search' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('search')}>
          Search
        </button>
        <button className={page === 'audit' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('audit')}>
          Audit
        </button>
      </nav>

      <main className="main-content">
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

        {page === 'bible' && (
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
                    const chapterData = findApprovedChapter(nextBook, 1)
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
                    const chapterData = findApprovedChapter(navigationBook, nextChapter)
                    setNavigationChapter(nextChapter)
                    setNavigationVerse(chapterData?.verses[0]?.verse ?? 1)
                  }}
                >
                  {navigationChapterNumbers.map((chapterNumber) => (
                    <option
                      key={chapterNumber}
                      value={chapterNumber}
                      disabled={!findApprovedChapter(navigationBook, chapterNumber)}
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

        {page === 'audit' && (
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

        {page === 'scripture' && (
          <section className="scripture-reader" aria-labelledby="scripture-reader-title">
            <div className="page-heading">
              <p className="eyebrow">SCRIPTURE READER</p>
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
                    const chapterData = findApprovedChapter(nextBook, nextChapter)
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
                    const chapterData = findApprovedChapter(navigationBook, nextChapter)
                    setNavigationChapter(nextChapter)
                    setNavigationVerse(chapterData?.verses[0]?.verse ?? 1)
                  }}
                >
                  {navigationChapterNumbers.map((chapterNumber) => (
                    <option key={chapterNumber} value={chapterNumber} disabled={!findApprovedChapter(navigationBook, chapterNumber)}>
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

        {page === 'library' && (
          <section className="library-page" aria-labelledby="library-title">
            <div className="page-heading">
              <p className="eyebrow">PERSONAL LIBRARY</p>
              <h1 id="library-title">Saved Items</h1>
              <p>Your saved pathways and Scripture verses stay on this device for now.</p>
            </div>

            <section className="saved-library-section" aria-labelledby="saved-pathways-title">
              <div className="saved-library-heading">
                <h2 id="saved-pathways-title">Saved Pathways</h2>
              </div>
              {isBookmarked ? (
                <article className="library-item">
                  <div>
                    <span className="pathway-category">{todaysPathway.category}</span>
                    <p className="pathway-date">{todaysPathway.dateLabel}</p>
                    <h3>{todaysPathway.title}</h3>
                    <p className="scripture-reference">{todaysPathway.scriptureReference}</p>
                  </div>
                  <button className="library-open-button" type="button" onClick={() => openPage('home')}>
                    Open Pathway
                  </button>
                </article>
              ) : (
                <p className="saved-empty-text">No saved pathways yet.</p>
              )}
            </section>

            <section className="saved-library-section" aria-labelledby="saved-verses-title">
              <div className="saved-library-heading">
                <h2 id="saved-verses-title">Saved Verses</h2>
              </div>
              {savedVerses.length > 0 ? (
                <div className="saved-verse-list">
                  {savedVerses.map((item) => {
                    const chapter = findApprovedChapter(item.book, item.chapter)
                    const verse = chapter?.verses.find((entry) => entry.verse === item.verse)
                    return (
                      <article className="library-item saved-verse-item" key={item.book + '-' + item.chapter + '-' + item.verse}>
                        <div>
                          <p className="search-result-reference">{item.book} {item.chapter}:{item.verse}</p>
                          <p className="search-result-text">{verse?.text ?? 'Verse text unavailable.'}</p>
                          {verseNotes[item.book + '|' + item.chapter + '|' + item.verse] && (
                            <p className="saved-verse-note">
                              <strong>My note:</strong> {verseNotes[item.book + '|' + item.chapter + '|' + item.verse]}
                            </p>
                          )}
                        </div>
                        <button
                          className="library-open-button"
                          type="button"
                          onClick={() => chapter && openScripture(chapter, item.verse)}
                          disabled={!chapter || !verse}
                        >
                          Open Verse
                        </button>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="saved-empty-text">No saved verses yet. Save a verse from the Scripture Reader.</p>
              )}
            </section>
          </section>
        )}

        {page === 'search' && (
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
                  const chapter = findApprovedChapter(result.book, result.chapter)
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

      <footer className="site-footer">
        Edwin&apos;s Pathway Notes Daily
      </footer>
    </div>
  )
}

export default App
