import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

export const AUTH_FILE = path.join(__dirname, '.auth', 'user.json')

setup('authenticate via Auth0', async ({ page }) => {
    const username = process.env.E2E_AUTH0_USERNAME
    const password = process.env.E2E_AUTH0_PASSWORD

    // Ensure the directory always exists so Playwright can read storageState
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

    if (!username || !password) {
        console.warn(
            '[setup] E2E_AUTH0_USERNAME / E2E_AUTH0_PASSWORD not set — ' +
            'writing empty session. Authenticated tests will fail.'
        )
        fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }))
        return
    }

    // Trigger the Auth0 login flow
    await page.goto('http://localhost:3000/auth/login')

    // Auth0 hosted login page
    await page.waitForURL(/auth0\.com/, { timeout: 10_000 })

    await page.getByLabel(/email/i).fill(username)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('textbox', { name: 'Password' }).fill(password)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    // Wait until redirected back to the app
    await page.waitForURL('http://localhost:3000/**', { timeout: 15_000 })

    // Persist the session cookie for reuse by authenticated test projects
    await page.context().storageState({ path: AUTH_FILE })
})
