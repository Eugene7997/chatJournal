import { test, expect } from '@playwright/test'

// ─── Public pages ─────────────────────────────────────────────────────────────

test.describe('Landing page (/)', () => {
  test('loads without error', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveTitle(/error/i)
  })

  test('contains a link to /login', async ({ page }) => {
    await page.goto('/')
    const loginLinks = page.getByRole('link', { name: /log in|sign in|get started/i })
    await expect(loginLinks.first()).toBeVisible()
  })
})

test.describe('About page (/about)', () => {
  test('loads without error', async ({ page }) => {
    const response = await page.goto('/about')
    expect(response?.status()).toBeLessThan(400)
  })

  test('renders page content', async ({ page }) => {
    await page.goto('/about')
    // Page should have some visible text content
    const body = page.locator('body')
    await expect(body).not.toBeEmpty()
  })
})

test.describe('Login page (/login)', () => {
  test('loads without error', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBeLessThan(400)
  })
})

// ─── Auth redirects ───────────────────────────────────────────────────────────

test.describe('Protected route redirects (unauthenticated)', () => {
  test('/chat redirects away when not logged in', async ({ page }) => {
    await page.goto('/chat')
    // Should redirect to /login (not stay on /chat)
    await expect(page).not.toHaveURL(/\/chat$/)
  })

  test('/journals redirects away when not logged in', async ({ page }) => {
    await page.goto('/journals')
    await expect(page).not.toHaveURL(/\/journals$/)
  })

  test('/account redirects away when not logged in', async ({ page }) => {
    await page.goto('/account')
    await expect(page).not.toHaveURL(/\/account$/)
  })
})
