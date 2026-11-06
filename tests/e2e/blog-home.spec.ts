import { expect, test } from '@playwright/test'

test.describe('Pathway Notes Daily blog home', () => {
  test('loads real read-only Blogger posts and opens original articles', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Today’s Pathway/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Latest Published Posts/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Verse of the Day/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Subscribe — Not Connected/i })).toBeDisabled()
    await expect(page.getByRole('button', { name: /Bible Study/i }).first()).toBeVisible()

    const feedNotice = page.locator('.blog-prototype-notice').first()
    await expect(feedNotice).toContainText(/read-only feed/i)
    await expect(page.getByRole('link', { name: /Open original post:/i }).first()).toHaveAttribute(
      'href',
      /^https:\/\/pathwaynotes\.blogspot\.com\//,
    )
    await expect(feedNotice).toContainText(/Feed reports \d+ published posts; showing \d+ unique recent entries\./i)

    await page.getByRole('button', { name: 'Bible Study', exact: true }).first().click()
    await expect(page.getByRole('heading', { name: 'Tamil Bible' })).toBeVisible()
    await expect(page.getByLabel('Book')).toBeVisible()
  })

  test('restores highlighted verses in the Library after a page refresh', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Bible Study', exact: true }).first().click()
    await expect(page.getByRole('heading', { name: 'Tamil Bible' })).toBeVisible()

    await page.getByLabel('Book').selectOption('1 Samuel')
    await page.getByLabel('Chapter').selectOption('11')
    await page.getByLabel('Verse').selectOption('2')
    await page.getByRole('button', { name: 'Go to Scripture' }).click()
    await expect(page.getByRole('button', { name: 'Highlight Verse' })).toBeVisible()
    await page.getByRole('button', { name: 'Highlight Verse' }).click()
    await expect(page.getByRole('button', { name: 'Highlighted ✓' })).toHaveAttribute('aria-pressed', 'true')

    await expect.poll(async () => page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('pathway-highlighted-verses') ?? '{}')
      return stored['1 Samuel|11|2']
    })).toBe(true)

    await page.reload()
    await page.getByRole('button', { name: 'Personal Notes', exact: true }).first().click()
    await expect(page.getByRole('heading', { name: 'Highlighted Verses' })).toBeVisible()
    await expect(page.getByText('1 Samuel 11:2', { exact: true })).toBeVisible()
  })

  test('downloads the Scripture registry only after opening Bible Study', async ({ page }) => {
    const registryRequests: string[] = []
    page.on('request', (request) => {
      if (request.resourceType() === 'script' && request.url().includes('/assets/registry-')) {
        registryRequests.push(request.url())
      }
    })

    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Latest Published Posts/i })).toBeVisible()
    expect(registryRequests, 'Home must not request the large Scripture registry chunk').toHaveLength(0)

    await page.getByRole('button', { name: 'Bible Study', exact: true }).first().click()
    await expect(page.getByRole('heading', { name: 'Tamil Bible' })).toBeVisible()
    await expect.poll(() => registryRequests.length, {
      message: 'Bible Study should request the lazy-loaded Scripture registry chunk',
    }).toBeGreaterThan(0)
  })

  test('routes the Home Books Library and Personal Notes tiles to their distinct pages', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Books Library நூலகம்/ }).click()
    await expect(page.getByRole('heading', { name: 'Books Library', exact: true })).toBeVisible()

    await page.goto('/')
    await page.getByRole('button', { name: /Personal Notes எனது குறிப்புகள்/ }).click()
    await expect(page.getByRole('heading', { name: 'Personal Notes Backup' })).toBeVisible()
  })

  test('opens Books Library without loading Scripture data; Personal Notes still loads it', async ({ page }) => {
    const registryRequests: string[] = []
    page.on('request', (request) => {
      if (request.resourceType() === 'script' && request.url().includes('/assets/registry-')) {
        registryRequests.push(request.url())
      }
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Books Library', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Books Library', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Your Books (0)' })).toBeVisible()
    await page.getByLabel('Book title *').fill('Knowing God')
    await page.getByLabel('Author(s)').fill('J. I. Packer')
    await page.getByLabel('Language').fill('English')
    await page.getByLabel('Category').fill('Theology')
    await page.getByLabel('Reading status').selectOption('reading')
    await page.getByRole('button', { name: 'Save Book Record' }).click()
    await expect(page.getByRole('heading', { name: 'Knowing God' })).toBeVisible()
    await expect(page.getByText('J. I. Packer')).toBeVisible()
    await expect(page.getByText('Category: Theology')).toBeVisible()
    await expect(page.getByText('Language: English')).toBeVisible()
    await expect(page.getByText('RECORD-ONLY · reading')).toBeVisible()
    await page.getByLabel('Search books').fill('Knowing')
    await expect(page.getByRole('heading', { name: 'Knowing God' })).toBeVisible()
    await page.getByLabel('Search books').fill('not found')
    await expect(page.getByText('No books match this search or filter.')).toBeVisible()
    await page.getByLabel('Search books').fill('')
    expect(registryRequests, 'Books Library must not request the Scripture registry').toHaveLength(0)
    expect(registryRequests, 'Books Library must not request the Scripture registry').toHaveLength(0)

    await page.getByRole('button', { name: 'Personal Notes', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Personal Notes Backup' })).toBeVisible()
    await expect.poll(() => registryRequests.length, {
      message: 'Personal Notes should continue to load the Scripture registry for saved verse validation',
    }).toBeGreaterThan(0)
  })

  test('previews and merges a Books backup without changing Personal Notes data', async ({ page }) => {
    const timestamp = '2026-11-06T08:00:00.000Z'
    const existing = {
      id: 'book-existing',
      title: 'Knowing God',
      authors: ['J. I. Packer'],
      format: 'record-only',
      fileHandleStatus: 'not-linked',
      tags: [],
      readingStatus: 'to-read',
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    const duplicate = { ...existing, id: 'book-duplicate' }
    const incoming = {
      ...existing,
      id: 'book-new',
      title: 'Mere Christianity',
      authors: ['C. S. Lewis'],
    }
    await page.addInitScript(({ catalogue, savedVerses }) => {
      localStorage.setItem('pathway-books-catalogue:v1', JSON.stringify({ schemaVersion: 1, records: catalogue }))
      localStorage.setItem('pathway-saved-verses', JSON.stringify(savedVerses))
    }, { catalogue: [existing], savedVerses: [{ book: 'Genesis', chapter: 1, verse: 1 }] })

    await page.goto('/')
    await page.getByRole('button', { name: 'Books Library', exact: true }).click()
    const backup = {
      app: 'pathway-notes-books-library',
      schemaVersion: 1,
      exportedAt: timestamp,
      data: { records: [duplicate, incoming] },
    }
    await page.locator('#books-backup-file').setInputFiles({
      name: 'books-backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backup)),
    })
    await expect(page.getByRole('heading', { name: 'Restore Preview' })).toBeVisible()
    await expect(page.getByText('Backup records: 2')).toBeVisible()
    await expect(page.getByText('Matching title and author: 1')).toBeVisible()
    await expect(page.getByText('New records for merge: 1')).toBeVisible()

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Merge New Records' }).click()
    await expect(page.getByRole('heading', { name: 'Your Books (2)' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mere Christianity' })).toBeVisible()
    const savedVerses = await page.evaluate(() => localStorage.getItem('pathway-saved-verses'))
    expect(savedVerses).toBe(JSON.stringify([{ book: 'Genesis', chapter: 1, verse: 1 }]))
  })

  test('exports a versioned Books Library JSON backup', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Books Library', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download Books Backup' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/^pathway-books-catalogue-backup-.*\\.json$/)
    await expect(page.getByText(/Books Catalogue backup downloaded/)).toBeVisible()
  })

  test('shows a reading placeholder when a Blogger post image fails to load', async ({ page }) => {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() === 'image') {
        await route.abort()
        return
      }
      await route.continue()
    })

    await page.goto('/')
    const firstCard = page.locator('.blog-post-card').first()
    await expect(firstCard).toBeVisible({ timeout: 30000 })
    await expect(firstCard.locator('.blog-post-image-placeholder')).toBeVisible()
    await expect(firstCard.locator('.blog-post-image-button img')).toHaveCount(0)
  })

  test('keeps tablet navigation inside the viewport without page-level horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    const layout = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }))
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth)
    await expect(page.getByRole('heading', { name: /Today’s Pathway/i })).toBeVisible()
  })

  test('keeps the blog home usable at mobile width and supports theme toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Latest Published Posts/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Open original post:/i }).first()).toBeVisible()
    await page.getByRole('button', { name: /Switch to dark theme/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  })

  test('covers responsive layouts at 320, 380, 390, 640, and 768 pixels', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/')
    await expect(page.locator('.blog-post-grid .blog-post-card').first()).toBeVisible({ timeout: 30000 })

    const cases = [
      { width: 320, categoryColumns: 2, postColumns: 1 },
      { width: 380, categoryColumns: 2, postColumns: 1 },
      { width: 390, categoryColumns: 2, postColumns: 1 },
      { width: 640, categoryColumns: 2, postColumns: 2 },
      { width: 768, categoryColumns: 4, postColumns: 2 },
    ]

    for (const viewport of cases) {
      await page.setViewportSize({ width: viewport.width, height: 800 })
      const layout = await page.evaluate(() => {
        const columnCount = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector)
          if (!element) return 0
          return getComputedStyle(element).gridTemplateColumns.split(/\s+/).length
        }

        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          categoryColumns: columnCount('.blog-category-grid'),
          postColumns: columnCount('.blog-post-grid'),
        }
      })

      expect(layout.documentWidth, `horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(layout.viewportWidth)
      expect(layout.categoryColumns, `category columns at ${viewport.width}px`).toBe(viewport.categoryColumns)
      expect(layout.postColumns, `post columns at ${viewport.width}px`).toBe(viewport.postColumns)
    }
  })

  test('keeps dark-mode blog action links above WCAG AA contrast', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('.blog-post-foot a').first()).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /Switch to dark theme/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    const contrast = await page.evaluate(() => {
      const checks = [
        { selector: '.blog-section-heading > button', color: 'rgb(142, 203, 255)', backgrounds: [[17, 24, 39], [7, 27, 45], [24, 38, 58]] },
        { selector: '.blog-post-foot a', color: 'rgb(142, 203, 255)', backgrounds: [[17, 24, 39], [7, 27, 45], [24, 38, 58]] },
        { selector: '.blog-verse-card > button', color: 'rgb(142, 203, 255)', backgrounds: [[24, 38, 58]] },
        { selector: '.blog-sidebar-panel > button', color: 'rgb(214, 231, 251)', backgrounds: [[24, 38, 58]] },
        { selector: '.blog-brand-title', color: 'rgb(245, 247, 252)', backgrounds: [[24, 34, 53]] },
      ]
      const luminance = (rgb: number[]) => {
        const channels = rgb.map((value) => {
          const channel = value / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
      }
      const parseRgb = (value: string) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? []
      return checks.map(({ selector, color: expectedColor, backgrounds }) => {
        const element = document.querySelector<HTMLElement>(selector)
        if (!element) return { selector, missing: true, color: '', expectedColor, ratios: [] }
        const color = getComputedStyle(element).color
        const foreground = luminance(parseRgb(color))
        const ratios = backgrounds.map((background) => {
          const backgroundLuminance = luminance(background)
          return (Math.max(foreground, backgroundLuminance) + 0.05) /
            (Math.min(foreground, backgroundLuminance) + 0.05)
        })
        return { selector, missing: false, color, expectedColor, ratios }
      })
    })

    for (const item of contrast) {
      expect(item.missing, `missing element: ${item.selector}`).toBe(false)
      expect(item.color, `unexpected dark-mode text color: ${item.selector}`).toBe(item.expectedColor)
      for (const ratio of item.ratios) {
        expect(ratio, `contrast ratio for ${item.selector}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

})
