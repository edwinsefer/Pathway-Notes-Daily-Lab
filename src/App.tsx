import { useEffect, useState } from 'react'
import { todaysPathway } from './data/todaysPathway'

type Theme = 'light' | 'dark'

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('pathway-theme')
    return savedTheme === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('pathway-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
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
        <a href="#home">Home</a>
        <a href="#library">Library</a>
        <a href="#search">Search</a>
      </nav>

      <main className="main-content">
        <section className="pathway-card" aria-labelledby="today-pathway-title">
          <div className="pathway-meta">
            <p className="eyebrow">{todaysPathway.label}</p>
            <span className="pathway-category">{todaysPathway.category}</span>
          </div>

          <p className="pathway-date">{todaysPathway.dateLabel}</p>

          <h1 id="today-pathway-title">{todaysPathway.title}</h1>
          <p className="scripture-reference">{todaysPathway.scriptureReference}</p>

          <div className="pathway-section">
            <h2>Reflection</h2>
            <p>{todaysPathway.reflection}</p>
          </div>

          <div className="pathway-section">
            <h2>Prayer</h2>
            <p>{todaysPathway.prayer}</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        Edwin&apos;s Pathway Notes Daily
      </footer>
    </div>
  )
}

export default App
