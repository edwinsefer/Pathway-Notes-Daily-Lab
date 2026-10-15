import { expect, test } from '@playwright/test'

test.describe('Pathway Notes Daily blog home', () => {
  test('shows the bilingual blog model and keeps reader tools reachable', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Today’s Pathway/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Design Preview — Sample Posts/i })).toBeVisible()
    await expect(page.locator('.blog-prototype-notice').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /Verse of the Day/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Subscribe — Not Connected/i })).toBeDisabled()
    await expect(page.getByRole('button', { name: /Bible Study/i }).first()).toBeVisible()

    await page.getByRole('button', { name: 'Bible Study', exact: true }).first().click()
    await expect(page.getByRole('heading', { name: 'Tamil Bible' })).toBeVisible()
    await expect(page.getByLabel('Book')).toBeVisible()
  })

  test('keeps the blog home usable at mobile width and supports theme toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Design Preview — Sample Posts/i })).toBeVisible()
    await page.getByRole('button', { name: /Switch to dark theme/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  })
})
