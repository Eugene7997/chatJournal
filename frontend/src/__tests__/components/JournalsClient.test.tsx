import React from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JournalsClient from '@/components/JournalsClient'
import type { Journal } from '@/lib/types/types'

const mockJournals: Journal[] = [
    {
        id: 'journal-1',
        session_id: 'session-1',
        sub: 'auth0|user-1',
        title: 'Morning Walk',
        content: 'Date: Wednesday, January 1, 2025\n\n09:00 - Entry: Went for a long walk.\nFeelings: Refreshed and calm.',
        created_at: '2025-01-01T09:00:00Z',
    },
    {
        id: 'journal-2',
        session_id: 'session-2',
        sub: 'auth0|user-1',
        title: 'Late Night Thoughts',
        content: 'Date: Thursday, January 2, 2025\n\n23:00 - Entry: Reflected on the week.\nFeelings: Thoughtful.',
        created_at: '2025-01-02T23:00:00Z',
    },
]

beforeEach(() => {
    // jsdom does not provide fetch or Response; assign a plain mock
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
    }) as unknown as typeof fetch
})

afterEach(() => {
    jest.clearAllMocks()
})

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('JournalsClient rendering', () => {
    it('renders all journal titles', () => {
        render(<JournalsClient journals={mockJournals} />)
        expect(screen.getByText('Morning Walk')).toBeInTheDocument()
        expect(screen.getByText('Late Night Thoughts')).toBeInTheDocument()
    })

    it('renders the search input', () => {
        render(<JournalsClient journals={mockJournals} />)
        expect(screen.getByPlaceholderText(/search journals/i)).toBeInTheDocument()
    })

    it('shows the empty state message when no journals are provided', () => {
        render(<JournalsClient journals={[]} />)
        expect(screen.getByText(/no saved journals yet/i)).toBeInTheDocument()
    })

    it('shows "View chat →" links pointing to the correct session', () => {
        render(<JournalsClient journals={mockJournals} />)
        const links = screen.getAllByRole('link', { name: /view chat/i })
        expect(links[0]).toHaveAttribute('href', '/chat?session=session-1')
        expect(links[1]).toHaveAttribute('href', '/chat?session=session-2')
    })

    it('renders the calendar with month navigation buttons', () => {
        render(<JournalsClient journals={mockJournals} />)
        expect(screen.getByRole('button', { name: '‹' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '›' })).toBeInTheDocument()
    })
})

// ─── Search ───────────────────────────────────────────────────────────────────

describe('JournalsClient search', () => {
    it('filters journals by content (case-insensitive)', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)
        await user.type(screen.getByPlaceholderText(/search journals/i), 'long walk')
        expect(screen.getByText('Morning Walk')).toBeInTheDocument()
        expect(screen.queryByText('Late Night Thoughts')).not.toBeInTheDocument()
    })

    it('shows the "no journals match" message when search has no results', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)
        await user.type(screen.getByPlaceholderText(/search journals/i), 'xyzzy-no-match')
        expect(screen.getByText(/no journals match your filters/i)).toBeInTheDocument()
    })

    it('restores the full list when the search input is cleared', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)
        const input = screen.getByPlaceholderText(/search journals/i)
        await user.type(input, 'long walk')
        expect(screen.queryByText('Late Night Thoughts')).not.toBeInTheDocument()
        await user.clear(input)
        expect(screen.getByText('Late Night Thoughts')).toBeInTheDocument()
    })
})

// ─── Delete individual journal ────────────────────────────────────────────────

describe('JournalsClient delete individual journal', () => {
    it('removes the journal from the list after successful deletion', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)

        // The delete buttons are inside <details> content — open the first one
        const firstDetails = screen.getByText('Morning Walk').closest('details')!
        const deleteBtn = within(firstDetails).getAllByRole('button').at(-1)! // trash is last
        await user.click(deleteBtn)

        await waitFor(() => {
            expect(screen.queryByText('Morning Walk')).not.toBeInTheDocument()
        })
        expect(screen.getByText('Late Night Thoughts')).toBeInTheDocument()
    })

    it('calls DELETE /api/journals with the correct journalId', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)

        const firstDetails = screen.getByText('Morning Walk').closest('details')!
        const deleteBtn = within(firstDetails).getAllByRole('button').at(-1)!
        await user.click(deleteBtn)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/journals',
                expect.objectContaining({
                    method: 'DELETE',
                    body: JSON.stringify({ journalId: 'journal-1' }),
                })
            )
        })
    })
})

// ─── Delete all journals ──────────────────────────────────────────────────────

describe('JournalsClient delete all journals', () => {
    it('shows confirmation prompt when "Delete all journals" is clicked', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)
        await user.click(screen.getByRole('button', { name: /delete all journals/i }))
        expect(screen.getByRole('button', { name: /confirm delete all/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('cancels the confirmation when "Cancel" is clicked', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)
        await user.click(screen.getByRole('button', { name: /delete all journals/i }))
        await user.click(screen.getByRole('button', { name: /cancel/i }))
        expect(screen.queryByRole('button', { name: /confirm delete all/i })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: /delete all journals/i })).toBeInTheDocument()
    })

    it('clears the list and calls DELETE with deleteAll=true on confirmation', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)
        await user.click(screen.getByRole('button', { name: /delete all journals/i }))
        await user.click(screen.getByRole('button', { name: /confirm delete all/i }))

        await waitFor(() => {
            expect(screen.queryByText('Morning Walk')).not.toBeInTheDocument()
            expect(screen.queryByText('Late Night Thoughts')).not.toBeInTheDocument()
        })
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/journals',
            expect.objectContaining({
                method: 'DELETE',
                body: JSON.stringify({ deleteAll: true }),
            })
        )
    })
})

// ─── Edit flow ────────────────────────────────────────────────────────────────

describe('JournalsClient edit flow', () => {
    it('shows an inline title input and content textarea when the edit button is clicked', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)

        const firstDetails = screen.getByText('Morning Walk').closest('details')!
        const editBtn = within(firstDetails).getAllByRole('button').at(0)! // edit is first
        await user.click(editBtn)

        expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/journal content/i)).toBeInTheDocument()
    })

    it('pre-fills the title input with the current title', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)

        const firstDetails = screen.getByText('Morning Walk').closest('details')!
        const editBtn = within(firstDetails).getAllByRole('button').at(0)!
        await user.click(editBtn)

        const titleInput = screen.getByPlaceholderText(/title/i) as HTMLInputElement
        expect(titleInput.value).toBe('Morning Walk')
    })

    it('cancels edit on Escape and restores the read-only view', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)

        const firstDetails = screen.getByText('Morning Walk').closest('details')!
        const editBtn = within(firstDetails).getAllByRole('button').at(0)!
        await user.click(editBtn)

        await user.keyboard('{Escape}')
        expect(screen.queryByPlaceholderText(/title/i)).not.toBeInTheDocument()
        expect(screen.getByText('Morning Walk')).toBeInTheDocument()
    })

    it('cancels edit when the "Cancel" button is clicked', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)

        const firstDetails = screen.getByText('Morning Walk').closest('details')!
        const editBtn = within(firstDetails).getAllByRole('button').at(0)!
        await user.click(editBtn)

        await user.click(screen.getByRole('button', { name: /cancel/i }))
        expect(screen.queryByPlaceholderText(/title/i)).not.toBeInTheDocument()
    })

    it('calls PATCH /api/journals and updates the title when Save is clicked', async () => {
        const user = userEvent.setup()
        render(<JournalsClient journals={mockJournals} />)

        const firstDetails = screen.getByText('Morning Walk').closest('details')!
        const editBtn = within(firstDetails).getAllByRole('button').at(0)!
        await user.click(editBtn)

        const titleInput = screen.getByPlaceholderText(/title/i)
        await user.clear(titleInput)
        await user.type(titleInput, 'Updated Title')
        await user.click(screen.getByRole('button', { name: /^save$/i }))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/journals',
                expect.objectContaining({
                    method: 'PATCH',
                    body: expect.stringContaining('Updated Title'),
                })
            )
        })
        await waitFor(() => {
            expect(screen.getByText('Updated Title')).toBeInTheDocument()
        })
    })
})
