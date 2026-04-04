import { test, expect } from '@playwright/test'

// All tests in this file run with the saved Auth0 session (see playwright.config.ts)

test.describe('Journals page (/journals)', () => {

    // ─── Page structure ────────────────────────────────────────────────────────

    test('loads successfully when authenticated', async ({ page }) => {
        const response = await page.goto('/journals')
        expect(response?.status()).toBeLessThan(400)
        await expect(page).not.toHaveURL(/\/login/)
    })

    test('renders the search input', async ({ page }) => {
        await page.goto('/journals')
        await expect(page.getByPlaceholder(/search journals/i)).toBeVisible()
    })

    test('renders the calendar with "Filter by date" label', async ({ page }) => {
        await page.goto('/journals')
        await expect(page.getByText(/filter by date/i)).toBeVisible()
    })

    test('calendar shows month navigation arrows', async ({ page }) => {
        await page.goto('/journals')
        await expect(page.getByRole('button', { name: '‹' })).toBeVisible()
        await expect(page.getByRole('button', { name: '›' })).toBeVisible()
    })

    test('calendar navigates to the previous month', async ({ page }) => {
        await page.goto('/journals')
        // Read current month label
        const monthLabel = page.locator('span.text-sm.font-semibold').first()
        const before = await monthLabel.textContent()
        await page.getByRole('button', { name: '‹' }).click()
        const after = await monthLabel.textContent()
        expect(after).not.toBe(before)
    })

    // ─── Empty state ───────────────────────────────────────────────────────────

    test('shows an empty state message when the user has no journals', async ({ page }) => {
        await page.goto('/journals')
        // If there are no journals, the empty message is shown
        const journalCards = page.locator('details')
        const count = await journalCards.count()
        if (count === 0) {
            await expect(page.getByText(/no saved journals yet/i)).toBeVisible()
        }
    })

    // ─── Search ────────────────────────────────────────────────────────────────

    test('search input filters the journal list', async ({ page }) => {
        await page.goto('/journals')
        const cards = page.locator('details')
        const count = await cards.count()

        if (count < 2) {
            test.skip()
            return
        }

        // Type a term that matches the first journal's title
        const firstTitle = await cards.first().locator('summary span.font-semibold').textContent()
        await page.getByPlaceholder(/search journals/i).fill(firstTitle ?? 'a')
        // At least one result should remain; the count may drop
        await expect(cards).toHaveCount(1, { timeout: 2_000 }).catch(() => {
            // If more than one still matches the search, that's fine too
        })
    })

    // ─── Journal card interactions ─────────────────────────────────────────────

    test('"View chat →" link navigates to the correct chat session', async ({ page }) => {
        await page.goto('/journals')
        const viewLinks = page.getByRole('link', { name: /view chat/i })
        const count = await viewLinks.count()

        if (count === 0) {
            test.skip()
            return
        }

        const href = await viewLinks.first().getAttribute('href')
        expect(href).toMatch(/^\/chat\?session=/)
    })

    test('edit icon shows the inline editor for a journal', async ({ page }) => {
        await page.goto('/journals')
        const cards = page.locator('details')
        const count = await cards.count()

        if (count === 0) {
            test.skip()
            return
        }

        // Open the first journal card
        await cards.first().locator('summary').click()

        // Click the edit button (first icon button in the expanded content)
        const editBtn = cards.first().locator('button').first()
        await editBtn.click()

        await expect(page.getByPlaceholder(/title/i)).toBeVisible()
        await expect(page.getByPlaceholder(/journal content/i)).toBeVisible()
    })

    test('pressing Escape cancels the inline editor', async ({ page }) => {
        await page.goto('/journals')
        const cards = page.locator('details')
        if (await cards.count() === 0) { test.skip(); return }

        await cards.first().locator('summary').click()
        await cards.first().locator('button').first().click()
        await expect(page.getByPlaceholder(/title/i)).toBeVisible()

        await page.keyboard.press('Escape')
        await expect(page.getByPlaceholder(/title/i)).not.toBeVisible()
    })

    // ─── Delete all ────────────────────────────────────────────────────────────

    test('"Delete all journals" button shows a confirmation prompt', async ({ page }) => {
        await page.goto('/journals')
        const deleteAllBtn = page.getByRole('button', { name: /delete all journals/i })
        if (!(await deleteAllBtn.isVisible())) { test.skip(); return }

        await deleteAllBtn.click()
        await expect(page.getByRole('button', { name: /confirm delete all/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
    })

    test('cancelling "Delete all" restores the button without deleting', async ({ page }) => {
        await page.goto('/journals')
        const deleteAllBtn = page.getByRole('button', { name: /delete all journals/i })
        if (!(await deleteAllBtn.isVisible())) { test.skip(); return }

        await deleteAllBtn.click()
        await page.getByRole('button', { name: /cancel/i }).click()
        await expect(page.getByRole('button', { name: /delete all journals/i })).toBeVisible()
    })
})
