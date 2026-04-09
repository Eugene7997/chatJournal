import { test, expect } from '@playwright/test'

test.describe('Landing page (/)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    // ─── Content ───────────────────────────────────────────────────────────────

    test('has a visible h1 heading', async ({ page }) => {
        await expect(page.locator('h1').first()).toBeVisible()
    })

    test('page title is set and not blank', async ({ page }) => {
        const title = await page.title()
        expect(title.trim().length).toBeGreaterThan(0)
    })

    test('"Get Started" CTA link is visible and points to /login', async ({ page }) => {
        const cta = page.getByRole('link', { name: /get started/i })
        await expect(cta).toBeVisible()
        await expect(cta).toHaveAttribute('href', '/login')
    })

    test('"Learn More" link is visible and points to /about', async ({ page }) => {
        const learnMore = page.getByRole('link', { name: /learn more/i })
        await expect(learnMore).toBeVisible()
        await expect(learnMore).toHaveAttribute('href', '/about')
    })

    test('features section renders all three feature cards', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Conversational Journaling' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Revisit Past Entries' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Private & Secure' })).toBeVisible()
    })

    test('bottom CTA section has a "Create an Account" link', async ({ page }) => {
        const bottomCta = page.getByRole('link', { name: /create an account/i })
        await expect(bottomCta).toBeVisible()
        await expect(bottomCta).toHaveAttribute('href', '/login')
    })

    test('footer is present on the page', async ({ page }) => {
        const footer = page.locator('footer')
        await expect(footer).toBeVisible()
    })

    // ─── Navbar (unauthenticated) ──────────────────────────────────────────────

    test('navbar logo is visible', async ({ page }) => {
        const logo = page.getByAltText(/chatjournal logo/i)
        await expect(logo).toBeVisible()
    })

    test('navbar contains an "About" link', async ({ page }) => {
        await expect(page.getByRole('link', { name: /^about$/i }).first()).toBeVisible()
    })

    test('navbar contains a "Login / Sign up" link when unauthenticated', async ({ page }) => {
        await expect(page.getByRole('link', { name: /login/i }).first()).toBeVisible()
    })

    test('navbar does NOT show Chat, Journals, or Account links when unauthenticated', async ({ page }) => {
        await expect(page.getByRole('link', { name: /^chat$/i })).toHaveCount(0)
        await expect(page.getByRole('link', { name: /^journals$/i })).toHaveCount(0)
        await expect(page.getByRole('link', { name: /^account$/i })).toHaveCount(0)
    })

    // ─── Responsive navbar ─────────────────────────────────────────────────────

    test('hamburger menu button is visible on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')
        const hamburger = page.getByRole('button', { name: /open menu/i })
        await expect(hamburger).toBeVisible()
    })

    test('mobile hamburger opens the nav drawer', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')
        const hamburger = page.getByRole('button', { name: /open menu/i })
        await hamburger.click()
        // After opening, the close button label changes and nav links appear
        await expect(page.getByRole('button', { name: /close menu/i })).toBeVisible()
        await expect(page.getByRole('link', { name: /^about$/i }).first()).toBeVisible()
    })

    test('desktop nav links are visible without opening a menu', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 })
        await page.goto('/')
        // Desktop nav (hidden on mobile) should show links directly
        const desktopNav = page.locator('div.hidden.md\\:flex nav')
        await expect(desktopNav.getByRole('link', { name: /^about$/i })).toBeVisible()
    })
})
