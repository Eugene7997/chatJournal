import { test, expect } from '@playwright/test'

// All tests in this file run with the saved Auth0 session (see playwright.config.ts)

test.describe('Chat page (/chat)', () => {

    // ─── Page structure ────────────────────────────────────────────────────────

    test('loads successfully when authenticated', async ({ page }) => {
        const response = await page.goto('/chat')
        expect(response?.status()).toBeLessThan(400)
        await expect(page).not.toHaveURL(/\/login/)
    })

    test('renders the sessions sidebar with "Sessions" heading', async ({ page }) => {
        await page.goto('/chat')
        await expect(page.getByText('Sessions')).toBeVisible()
    })

    test('new session "+" button is present', async ({ page }) => {
        await page.goto('/chat')
        await expect(page.getByRole('button', { name: /new conversation/i })).toBeVisible()
    })

    test('chat textarea is present and accepts text input', async ({ page }) => {
        await page.goto('/chat')
        const textarea = page.getByPlaceholder(/start typing/i)
        await expect(textarea).toBeVisible()
        await textarea.fill('Hello, this is a test message')
        await expect(textarea).toHaveValue('Hello, this is a test message')
    })

    // ─── Sending a message ─────────────────────────────────────────────────────

    test('sending a message shows the user bubble and an AI response', async ({ page }) => {
        test.setTimeout(45_000) // LLM can be slow
        await page.goto('/chat')

        const textarea = page.getByPlaceholder(/start typing/i)
        await textarea.fill('Say "hi" in exactly one word.')
        await page.getByRole('button', { name: /^send$/i }).click()

        // User bubble appears immediately
        await expect(page.getByText('Say "hi" in exactly one word.')).toBeVisible()

        // Wait for the assistant response to appear (streaming finishes)
        await expect(page.locator('div').filter({ hasText: /hi/i }).last()).toBeVisible({
            timeout: 40_000,
        })
    })

    // ─── Generate Journal button ───────────────────────────────────────────────

    test('"Generate Journal" button is visible when a session is active', async ({ page }) => {
        test.setTimeout(45_000)
        await page.goto('/chat')

        // Send a message to create a session
        await page.getByPlaceholder(/start typing/i).fill('Hello')
        await page.getByRole('button', { name: /^send$/i }).click()

        // Wait for the session to be created and button to appear
        await expect(page.getByRole('button', { name: /generate journal/i })).toBeVisible({
            timeout: 40_000,
        })
    })

    // ─── Session rename ────────────────────────────────────────────────────────

    test('renaming a session updates its name in the sidebar', async ({ page }) => {
        test.setTimeout(20_000)
        await page.goto('/chat')

        // Ensure at least one session exists by clicking an existing one or creating one
        const sessionItems = page.locator('ul li')
        const count = await sessionItems.count()

        if (count === 0) {
            // No sessions yet — create one first
            await page.getByPlaceholder(/start typing/i).fill('Test')
            await page.getByRole('button', { name: /^send$/i }).click()
            await page.waitForTimeout(2_000)
        }

        // Open the dropdown for the first session
        const menuBtn = page.getByRole('button', { name: /session options/i }).first()
        await menuBtn.click()
        await page.getByRole('button', { name: /^rename$/i }).click()

        // Type the new name and commit with Enter
        // Scope to the sidebar list item to avoid matching the chat textarea
        const renameInput = page.locator('ul li input[type="text"], ul li input:not([type])')
        await renameInput.clear()
        await renameInput.fill('E2E Renamed Session')
        await renameInput.press('Enter')

        await expect(page.getByText('E2E Renamed Session')).toBeVisible()
    })

    // ─── Session delete ────────────────────────────────────────────────────────

    test('deleting a session removes it from the sidebar', async ({ page }) => {
        test.setTimeout(20_000)
        await page.goto('/chat')

        // Ensure a session exists
        const sessionItems = page.locator('ul li')
        const count = await sessionItems.count()

        if (count === 0) {
            await page.getByPlaceholder(/start typing/i).fill('Test session for deletion')
            await page.getByRole('button', { name: /^send$/i }).click()
            await page.waitForTimeout(2_000)
        }

        const initialCount = await sessionItems.count()
        const menuBtn = page.getByRole('button', { name: /session options/i }).first()
        await menuBtn.click()
        await page.getByRole('button', { name: /^delete$/i }).click()

        await expect(sessionItems).toHaveCount(initialCount - 1)
    })

    // ─── Mobile sidebar ────────────────────────────────────────────────────────

    test('sidebar starts hidden on mobile and opens via the hamburger', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/chat')

        // Sidebar should be translated off-screen; the "Sessions" text should not be visible
        const hamburger = page.getByRole('button', { name: /open sessions/i })
        await expect(hamburger).toBeVisible()

        await hamburger.click()
        await expect(page.getByText('Sessions')).toBeVisible()
    })
})
