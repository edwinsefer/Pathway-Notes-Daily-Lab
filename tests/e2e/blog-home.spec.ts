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
})
