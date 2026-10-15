import './styles/blog-home.css'

type Destination = 'home' | 'bible' | 'library' | 'search' | 'audit'

type BlogHomeProps = {
  onNavigate: (page: Destination) => void
}

const categories = [
  { icon: '📖', title: "Today's Pathway", tamil: 'இன்றைய பாதை', tone: 'blue', page: 'home' as Destination },
  { icon: '✝️', title: 'Bible Study', tamil: 'வேதாகம ஆய்வு', tone: 'sand', page: 'bible' as Destination },
  { icon: '🕊️', title: 'Devotional', tamil: 'தியானச் செய்திகள்', tone: 'lavender', page: 'home' as Destination },
  { icon: '🌿', title: 'Christian Living', tamil: 'கிறிஸ்தவ வாழ்க்கை', tone: 'green', page: 'home' as Destination },
  { icon: '🙏', title: 'Prayer', tamil: 'ஜெபம்', tone: 'peach', page: 'home' as Destination },
  { icon: '📚', title: 'Book Reviews', tamil: 'நூல் விமர்சனம்', tone: 'sky', page: 'library' as Destination },
  { icon: '▥', title: 'Library', tamil: 'நூலகம்', tone: 'blue', page: 'library' as Destination },
]

const posts = [
  { date: 'Oct 15, 2026', title: 'Be Still and Know', tamil: 'அமர்ந்திருந்து தேவனை அறிந்துகொள்', excerpt: 'A quiet moment with God can change the way we see the day. Pause, listen, and remember that God is present.', category: "Today's Pathway", image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85', page: 'home' as Destination },
  { date: 'Oct 14, 2026', title: 'The Power of a Praying Life', tamil: 'ஜெப வாழ்க்கையின் வல்லமை', excerpt: 'Prayer is not a last option. It is our first response—a daily invitation to draw near to God.', category: 'Devotional', image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=900&q=85', page: 'home' as Destination },
  { date: 'Oct 13, 2026', title: 'Seeing Jesus in Isaiah', tamil: 'ஏசாயாவில் இயேசுவைக் காண்போம்', excerpt: 'Isaiah 7:11–15 points us to a greater truth—God with us. Let us explore this passage carefully.', category: 'Bible Study', image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=85', page: 'bible' as Destination },
  { date: 'Oct 12, 2026', title: 'Grow in Grace', tamil: 'கிருபையில் வளர்ச்சியடைவோம்', excerpt: 'Spiritual growth is a journey, not a hurry. Small steps, daily, make a difference.', category: 'Christian Living', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=85', page: 'home' as Destination },
  { date: 'Oct 11, 2026', title: 'When Life Feels Heavy', tamil: 'வாழ்க்கை பாரமாகத் தோன்றும்போது', excerpt: 'It is okay to feel tired. God invites us to come to Him with our burdens.', category: 'Prayer', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85', page: 'home' as Destination },
  { date: 'Oct 10, 2026', title: 'Book Review: Gentle and Lowly', tamil: 'நூல் விமர்சனம்: Gentle and Lowly', excerpt: 'A thoughtful book that deepens our understanding of the heart of Christ.', category: 'Book Reviews', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=85', page: 'library' as Destination },
]

export default function BlogHome({ onNavigate }: BlogHomeProps) {
  return (
    <div className="blog-home">
      <section className="blog-hero" aria-labelledby="blog-hero-title">
        <img className="blog-hero-image" src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=90" alt="Sunrise over a peaceful mountain valley" />
        <div className="blog-hero-shade" />
        <div className="blog-hero-copy">
          <p className="blog-hero-kicker">WALK WITH GOD • READ • REFLECT • GROW</p>
          <h1 id="blog-hero-title">Today’s Pathway<br /><span>இன்றைய பாதை</span></h1>
          <blockquote>“Your word is a lamp for my feet,<br />a light on my path.”<br /><small>— Psalm 119:105</small></blockquote>
          <button className="blog-primary-button" type="button" onClick={() => onNavigate('home')}>Read Today’s Pathway <span aria-hidden="true">→</span></button>
        </div>
        <div className="blog-hero-words" aria-hidden="true">Read<br />Reflect<br />Pray<br />Take a Step</div>
      </section>

      <section className="blog-category-grid" aria-label="Blog categories">
        {categories.map((category) => (
          <button className={`blog-category-tile ${category.tone}`} key={category.title} type="button" onClick={() => onNavigate(category.page)}>
            <span className="blog-category-icon" aria-hidden="true">{category.icon}</span>
            <strong>{category.title}</strong><span>{category.tamil}</span>
          </button>
        ))}
      </section>

      <div className="blog-content-grid">
        <section className="blog-posts-section" aria-labelledby="latest-posts-title">
          <div className="blog-section-heading"><h2 id="latest-posts-title">Latest Posts <span>சமீபத்திய பதிவுகள்</span></h2><button type="button" onClick={() => onNavigate('search')}>View All →</button></div>
          <div className="blog-post-grid">
            {posts.map((post) => (
              <article className="blog-post-card" key={post.title}>
                <button className="blog-post-image-button" type="button" onClick={() => onNavigate(post.page)} aria-label={`Open ${post.title}`}>
                  <img src={post.image} alt="" loading="lazy" />
                </button>
                <div className="blog-post-body">
                  <time>{post.date}</time><h3>{post.title}</h3><p className="blog-post-tamil">{post.tamil}</p><p className="blog-post-excerpt">{post.excerpt}</p>
                  <div className="blog-post-foot"><span>{post.category}</span><button type="button" onClick={() => onNavigate(post.page)}>Read More →</button></div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="blog-sidebar">
          <section className="blog-verse-card">
            <span className="blog-sidebar-icon">🌿</span><h2>Verse of the Day <span>இன்றைய வசனம்</span></h2>
            <blockquote>“Be still, and know that I am God.”<br /><small>— Psalm 46:10</small></blockquote>
            <button type="button" onClick={() => onNavigate('home')}>Read Reflection →</button>
          </section>
          <section className="blog-sidebar-panel"><h2>Categories <span>பிரிவுகள்</span></h2>{categories.map((category) => <button key={category.title} type="button" onClick={() => onNavigate(category.page)}><span aria-hidden="true">▰</span>{category.title} <small>({category.tamil})</small></button>)}</section>
          <section className="blog-subscribe-panel"><h2>Get Daily Pathway</h2><p>Receive a little encouragement for your walk with God.</p><form onSubmit={(event) => { event.preventDefault(); window.alert('Thank you! Email subscription will be connected when the publishing workflow is approved.') }}><label className="blog-visually-hidden" htmlFor="pathway-email">Your email address</label><input id="pathway-email" type="email" placeholder="Your email address" required /><button type="submit">Subscribe</button></form></section>
        </aside>
      </div>
      <section className="blog-tagline"><p>“Create Once. Inspire Everywhere.”</p><span>— Edwin’s Pathway Notes Daily</span></section>
      <footer className="blog-home-footer"><div><strong>☀️ Pathway Notes Daily</strong><span>Edwin’s Christian Reading Experience</span><small>Walk with God · Read · Reflect · Grow · Share</small></div><nav aria-label="Footer navigation"><button onClick={() => onNavigate('home')}>Today’s Pathway</button><button onClick={() => onNavigate('bible')}>Bible Study</button><button onClick={() => onNavigate('library')}>Open My Library</button><button onClick={() => onNavigate('search')}>Search</button></nav><p>© 2026 Pathway Notes Daily · Create Once. Inspire Everywhere.</p></footer>
    </div>
  )
}
