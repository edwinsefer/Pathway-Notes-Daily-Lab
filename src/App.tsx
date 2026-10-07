function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-title">Pathway Notes Daily</span>
          <span className="brand-subtitle">Creative Laboratory</span>
        </div>
      </header>

      <nav className="site-nav" aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#library">Library</a>
        <a href="#search">Search</a>
      </nav>

      <main className="main-content">
        <section className="welcome-card">
          <p className="eyebrow">LABORATORY • PHASE 1</p>
          <h1>Foundation</h1>
          <p>
            A clean, mobile-first foundation for Edwin&apos;s Christian Reading
            Experience.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        Edwin&apos;s Pathway Notes Daily
      </footer>
    </div>
  )
}

export default App
