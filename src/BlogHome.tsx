import { useEffect, useState } from 'react'
import './styles/blog-home.css'

type Destination = 'home' | 'bible' | 'library' | 'search' | 'audit'

type BloggerEntry = {
  title?: { $t?: string }
  published?: { $t?: string }
  updated?: { $t?: string }
  category?: Array<{ term?: string }>
  content?: { $t?: string }
  summary?: { $t?: string }
  link?: Array<{ rel?: string; href?: string }>
}

type BloggerFeedResponse = {
  feed?: {
    title?: { $t?: string }
    entry?: BloggerEntry[]
    openSearch$totalResults?: { $t?: string }
  }
}

type BlogPost = {
  title: string
  date: string
  url: string
  category: string
  excerpt: string
  image?: string
}

declare global {
  interface Window {
    pathwayBlogFeedCallback?: (data: BloggerFeedResponse) => void
  }
}

type BlogHomeProps = {
  onNavigate: (page: Destination) => void
}

const BLOG_FEED_URL =
  'https://pathwaynotes.blogspot.com/feeds/posts/default?alt=json-in-script&callback=pathwayBlogFeedCallback&max-results=20'

const categories = [
  { icon: '📖', title: "Today's Pathway", tamil: 'இன்றைய பாதை', tone: 'blue', page: 'home' as Destination },
  { icon: '✝️', title: 'Bible Study', tamil: 'வேதாகம ஆய்வு', tone: 'sand', page: 'bible' as Destination },
  { icon: '🕊️', title: 'Devotional', tamil: 'தியானச் செய்திகள்', tone: 'lavender', page: 'home' as Destination },
  { icon: '🌿', title: 'Christian Living', tamil: 'கிறிஸ்தவ வாழ்க்கை', tone: 'green', page: 'home' as Destination },
  { icon: '🙏', title: 'Prayer', tamil: 'ஜெபம்', tone: 'peach', page: 'home' as Destination },
  { icon: '📚', title: 'Book Reviews', tamil: 'நூல் விமர்சனம்', tone: 'sky', page: 'library' as Destination },
  { icon: '▥', title: 'Library', tamil: 'நூலகம்', tone: 'blue', page: 'library' as Destination },
]

function textFromHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function normalizePostUrl(value: string): string {
  try {
    const parsed = new URL(value)
    parsed.hash = ''
    parsed.search = ''
    parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/'
    return parsed.toString().replace(/\/$/, parsed.pathname === '/' ? '/' : '')
  } catch {
    return value.trim()
  }
}

function imageFromHtml(doc: Document): string | undefined {
  const image = doc.querySelector('img')
  if (!image) return undefined

  const srcset = image.getAttribute('srcset') ?? image.getAttribute('data-srcset')
  const firstSrcsetUrl = srcset?.split(',')[0]?.trim().split(/\s+/)[0]
  const candidate = image.getAttribute('src')
    || image.getAttribute('data-src')
    || image.getAttribute('data-lazy-src')
    || firstSrcsetUrl

  if (!candidate || !/^https?:\/\//i.test(candidate)) return undefined
  return candidate
}

function toBlogPost(entry: BloggerEntry): BlogPost | null {
  const title = entry.title?.$t?.trim()
  const rawUrl = entry.link?.find((link) => link.rel === 'alternate')?.href
  if (!title || !rawUrl) return null

  let parsedUrl: URL
  try {
    parsedUrl = new URL(rawUrl)
  } catch {
    return null
  }
  if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname.toLowerCase() !== 'pathwaynotes.blogspot.com') return null

  const html = entry.content?.$t ?? entry.summary?.$t ?? ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const image = imageFromHtml(doc)
  const category = entry.category?.map((item) => item.term?.trim()).find(Boolean) ?? 'Pathway Notes'
  const dateValue = entry.published?.$t ?? entry.updated?.$t
  const parsedDate = dateValue ? new Date(dateValue) : null
  const date = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsedDate)
    : ''

  const fullExcerpt = textFromHtml(html)
  const excerpt = fullExcerpt.length > 220 ? `${fullExcerpt.slice(0, 217).trimEnd()}…` : fullExcerpt

  return {
    title,
    url: parsedUrl.toString(),
    date,
    category,
    image,
    excerpt,
  }
}

function uniquePostsByUrl(posts: BlogPost[]): BlogPost[] {
  const seen = new Set<string>()
  return posts.filter((post) => {
    const key = normalizePostUrl(post.url)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function countRepeatedTitleDates(posts: BlogPost[]): number {
  const seen = new Set<string>()
  let repeats = 0
  for (const post of posts) {
    const key = `${post.title.normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase()}|${post.date}`
    if (seen.has(key)) repeats += 1
    else seen.add(key)
  }
  return repeats
}

export default function BlogHome({ onNavigate }: BlogHomeProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [feedStatus, setFeedStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading')
  const [feedTotal, setFeedTotal] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    const script = document.createElement('script')
    const timeout = window.setTimeout(() => {
      if (active) setFeedStatus('error')
      script.remove()
    }, 15000)

    window.pathwayBlogFeedCallback = (response) => {
      if (!active) return
      window.clearTimeout(timeout)
      const feed = response?.feed
      const entries = Array.isArray(feed?.entry) ? feed.entry : []
      const mapped = entries.map(toBlogPost).filter((post): post is BlogPost => post !== null)
      const uniquePosts = uniquePostsByUrl(mapped)
      const total = Number(feed?.['openSearch$totalResults']?.$t)
      setFeedTotal(Number.isFinite(total) ? total : mapped.length)
      setPosts(uniquePosts)
      setFeedStatus(uniquePosts.length ? 'ready' : 'empty')
    }

    script.src = BLOG_FEED_URL
    script.async = true
    script.onerror = () => {
      if (active) {
        window.clearTimeout(timeout)
        setFeedStatus('error')
      }
    }
    document.head.appendChild(script)

    return () => {
      active = false
      window.clearTimeout(timeout)
      script.remove()
      delete window.pathwayBlogFeedCallback
    }
  }, [])

  const repeatedTitleDateCount = countRepeatedTitleDates(posts)

  const feedMessage = feedStatus === 'loading'
    ? 'Loading the latest published posts from Pathway Notes Daily…'
    : feedStatus === 'empty'
      ? 'The Blogger feed responded, but no readable posts were returned.'
      : 'The live feed could not be loaded. Please try again later.'

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
          <div className="blog-section-heading">
            <h2 id="latest-posts-title">Latest Published Posts <span>சமீபத்திய பதிவுகள்</span></h2>
            <button type="button" onClick={() => onNavigate('search')}>Explore Search →</button>
          </div>
          <p className="blog-prototype-notice" role="note">
            Live, read-only feed from Edwin’s Stable Blogger Blog V12. Posts open their original Blogger articles. This Lab does not publish to or modify Blogger.
            {feedTotal !== null ? ` Feed reports ${feedTotal} published posts; showing ${posts.length} unique recent entries.` : ''}
            {repeatedTitleDateCount > 0 ? ` Review recommended: ${repeatedTitleDateCount} post(s) share a title and date; they are kept because they may be distinct articles.` : ''}
          </p>

          {feedStatus !== 'ready' && (
            <p className="blog-feed-status" role={feedStatus === 'error' ? 'alert' : 'status'} aria-live="polite">{feedMessage}</p>
          )}

          {feedStatus === 'ready' && (
            <div className="blog-post-grid">
              {posts.map((post) => (
                <article className="blog-post-card" key={post.url}>
                  <a className="blog-post-image-button" href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Open original post: ${post.title}`}>
                    {post.image
                      ? <img src={post.image} alt="" loading="lazy" />
                      : <span className="blog-post-image-placeholder" aria-hidden="true">✝</span>}
                  </a>
                  <div className="blog-post-body">
                    {post.date && <time dateTime={post.date}>{post.date}</time>}
                    <h3><a href={post.url} target="_blank" rel="noopener noreferrer">{post.title}</a></h3>
                    <p className="blog-post-excerpt">{post.excerpt || 'Open the original post to read the full reflection.'}</p>
                    <div className="blog-post-foot">
                      <span>{post.category}</span>
                      <a href={post.url} target="_blank" rel="noopener noreferrer">Read More →</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <aside className="blog-sidebar">
          <section className="blog-verse-card">
            <span className="blog-sidebar-icon">🌿</span><h2>Verse of the Day <span>இன்றைய வசனம்</span></h2>
            <blockquote>“Be still, and know that I am God.”<br /><small>— Psalm 46:10</small></blockquote>
            <button type="button" onClick={() => onNavigate('home')}>Read Reflection →</button>
          </section>
          <section className="blog-sidebar-panel"><h2>Categories <span>பிரிவுகள்</span></h2>{categories.map((category) => <button key={category.title} type="button" onClick={() => onNavigate(category.page)}><span aria-hidden="true">▰</span>{category.title} <small>({category.tamil})</small></button>)}</section>
          <section className="blog-subscribe-panel"><h2>Get Daily Pathway</h2><p>Receive a little encouragement for your walk with God.</p><p className="blog-prototype-notice" role="note">Email subscription is a design preview only. It is not connected, and no email address is collected or sent.</p><button className="blog-subscribe-disabled" type="button" disabled aria-describedby="subscription-status">Subscribe — Not Connected</button><span id="subscription-status" className="blog-visually-hidden">Email subscription is not available in this preview.</span></section>
        </aside>
      </div>
      <section className="blog-tagline"><p>“Create Once. Inspire Everywhere.”</p><span>— Edwin’s Pathway Notes Daily</span></section>
      <footer className="blog-home-footer"><div><strong>☀️ Pathway Notes Daily</strong><span>Edwin’s Christian Reading Experience</span><small>Walk with God · Read · Reflect · Grow · Share</small></div><nav aria-label="Footer navigation"><button onClick={() => onNavigate('home')}>Today’s Pathway</button><button onClick={() => onNavigate('bible')}>Bible Study</button><button onClick={() => onNavigate('library')}>Open My Library</button><button onClick={() => onNavigate('search')}>Search</button></nav><p>© 2026 Pathway Notes Daily · Create Once. Inspire Everywhere.</p></footer>
    </div>
  )
}
