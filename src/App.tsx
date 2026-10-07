import { useEffect, useState } from 'react'
import { todaysPathway } from './data/todaysPathway'
import { psalm46 } from './data/scripture/psalm46'
import { multiBookTest } from './data/scripture/multiBookTest'
import type { ScriptureChapter } from './data/scripture/psalm46'

type Theme = 'light' | 'dark'
type Page = 'home' | 'library' | 'search' | 'scripture' | 'bible'

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('pathway-theme')
    return savedTheme === 'dark' ? 'dark' : 'light'
  })
  const [page, setPage] = useState<Page>('home')
  const [selectedChapter, setSelectedChapter] = useState<ScriptureChapter>(psalm46)
  const [isFullPathwayOpen, setIsFullPathwayOpen] = useState(false)
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

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  const toggleBookmark = () => {
    setIsBookmarked((currentValue) => !currentValue)
  }

  const openScripture = (chapter: ScriptureChapter) => {
    setSelectedChapter(chapter)
    setPage('scripture')
    setIsFullPathwayOpen(false)
  }

  const openPage = (nextPage: Page) => {
    setPage(nextPage)
    setIsFullPathwayOpen(false)
  }

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
        <button className={page === 'home' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('bible')}>
          Home
        </button>
        <button className={page === 'library' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('library')}>
          Library
        </button>
        <button className={page === 'search' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => openPage('search')}>
          Search
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
              onClick={() => openPage('scripture')}
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

            <article className="scripture-library-item">
              <div>
                <span className="pathway-category">Old Testament</span>
                <h2>Psalms</h2>
                <p>Psalm 46 · {psalm46.translation}</p>
              </div>

              <button
                className="library-open-button"
                type="button"
                onClick={() => openScripture(psalm46)}
              >
                Open Psalm 46
              </button>
            </article>

            {multiBookTest.map((chapter) => (
              <article className="scripture-library-item" key={`${chapter.book}-${chapter.chapter}`}>
                <div>
                  <span className="pathway-category">
                    {chapter.book === 'Genesis' ? 'Old Testament' : 'New Testament'}
                  </span>
                  <h2>{chapter.book}</h2>
                  <p>Chapter {chapter.chapter} · {chapter.translation}</p>
                </div>

                <button
                  className="library-open-button"
                  type="button"
                  onClick={() => openScripture(chapter)}
                >
                  Open {chapter.book} {chapter.chapter}
                </button>
              </article>
            ))}
          </section>
        )}

        {page === 'scripture' && (
          <section className="scripture-reader" aria-labelledby="scripture-reader-title">
            <div className="page-heading">
              <p className="eyebrow">SCRIPTURE READER</p>
              <h1 id="scripture-reader-title">{selectedChapter.book} {selectedChapter.chapter}</h1>
              <p>{selectedChapter.translation}</p>
            </div>

            <div className="scripture-chapter">
              {selectedChapter.verses.map((verse) => (
                <p className="scripture-verse" key={verse.verse}>
                  <span className="verse-number">{verse.verse}</span>
                  <span>{verse.text}</span>
                </p>
              ))}
            </div>

            <button className="pathway-read-button" type="button" onClick={() => openPage('home')}>
              Back to Bible Library
            </button>
          </section>
        )}

        {page === 'library' && (
          <section className="library-page" aria-labelledby="library-title">
            <div className="page-heading">
              <p className="eyebrow">PATHWAY LIBRARY</p>
              <h1 id="library-title">Saved Pathways</h1>
              <p>Your saved reflections stay on this device for now.</p>
            </div>

            {isBookmarked ? (
              <article className="library-item">
                <div>
                  <span className="pathway-category">{todaysPathway.category}</span>
                  <p className="pathway-date">{todaysPathway.dateLabel}</p>
                  <h2>{todaysPathway.title}</h2>
                  <p className="scripture-reference">{todaysPathway.scriptureReference}</p>
                </div>

                <button className="library-open-button" type="button" onClick={() => openPage('home')}>
                  Open Pathway
                </button>
              </article>
            ) : (
              <div className="empty-library">
                <h2>No saved pathways yet</h2>
                <p>Save a pathway from Home and it will appear here.</p>
                <button className="pathway-read-button" type="button" onClick={() => openPage('home')}>
                  Go to Today&apos;s Pathway
                </button>
              </div>
            )}
          </section>
        )}

        {page === 'search' && (
          <section className="placeholder-page" aria-labelledby="search-title">
            <p className="eyebrow">SEARCH</p>
            <h1 id="search-title">Search is coming next.</h1>
            <p>We will build Scripture and pathway search after the Library foundation is tested.</p>
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
