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
