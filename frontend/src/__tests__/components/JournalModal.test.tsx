import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JournalModal from '@/components/JournalModal'

const SAMPLE_CONTENT = [
    'Date: Monday, January 1, 2024',
    '',
    '09:00 - Entry: Had a productive morning.',
    '',
    'Feelings: Energised and focused.',
].join('\n')

function renderModal(overrides: Partial<React.ComponentProps<typeof JournalModal>> = {}) {
    const props = {
        title: 'My Day',
        content: SAMPLE_CONTENT,
        onClose: jest.fn(),
        onSave: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    }
    render(<JournalModal {...props} />)
    return props
}

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('JournalModal rendering', () => {
    it('renders the provided title', () => {
        renderModal()
        expect(screen.getByText('My Day')).toBeInTheDocument()
    })

    it('falls back to "Journal Entry" when title is empty', () => {
        renderModal({ title: '' })
        expect(screen.getByText('Journal Entry')).toBeInTheDocument()
    })

    it('renders plain content lines', () => {
        renderModal()
        expect(screen.getByText('09:00 - Entry: Had a productive morning.')).toBeInTheDocument()
    })

    it('renders "Date:" line with font-bold class', () => {
        renderModal()
        const dateParagraph = screen.getByText('Date: Monday, January 1, 2024')
        expect(dateParagraph).toHaveClass('font-bold')
    })

    it('renders "Feelings:" line with italic class', () => {
        renderModal()
        const feelingsParagraph = screen.getByText('Feelings: Energised and focused.')
        expect(feelingsParagraph).toHaveClass('italic')
    })

    it('renders empty lines as <br> elements', () => {
        renderModal()
        // Content has 2 blank lines — verify they appear as <br> tags in the DOM
        const contentDiv = screen.getByText('09:00 - Entry: Had a productive morning.').closest('div')
        expect(contentDiv?.querySelectorAll('br').length).toBeGreaterThanOrEqual(1)
    })

    it('renders the "Save Journal" button initially', () => {
        renderModal()
        expect(screen.getByRole('button', { name: /save journal/i })).toBeInTheDocument()
    })
})

// ─── Close behaviour ──────────────────────────────────────────────────────────

describe('JournalModal close behaviour', () => {
    it('calls onClose when the × icon button (header) is clicked', async () => {
        const user = userEvent.setup()
        const { onClose } = renderModal()
        // Both the × button and the footer "Close" button have accessible name "Close".
        // The × button is first in DOM order.
        const closeButtons = screen.getAllByRole('button', { name: /^close$/i })
        await user.click(closeButtons[0])
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the "Close" text button (footer) is clicked', async () => {
        const user = userEvent.setup()
        const { onClose } = renderModal()
        const closeButtons = screen.getAllByRole('button', { name: /^close$/i })
        // Footer "Close" button is the last one
        await user.click(closeButtons[closeButtons.length - 1])
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})

// ─── Save flow ────────────────────────────────────────────────────────────────

describe('JournalModal save flow', () => {
    it('calls onSave when "Save Journal" is clicked', async () => {
        const user = userEvent.setup()
        const { onSave } = renderModal()
        await user.click(screen.getByRole('button', { name: /save journal/i }))
        expect(onSave).toHaveBeenCalledTimes(1)
    })

    it('shows "Saving..." and disables the button while onSave is pending', async () => {
        const user = userEvent.setup()
        // Never-resolving promise keeps the button in the saving state
        let resolvePromise!: () => void
        const pendingSave = jest.fn(
            () => new Promise<void>(resolve => { resolvePromise = resolve })
        )
        renderModal({ onSave: pendingSave })

        await user.click(screen.getByRole('button', { name: /save journal/i }))

        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
        resolvePromise() // clean up — resolve the promise so no act() warnings
    })

    it('shows "Saved!" and disables the button after onSave resolves', async () => {
        const user = userEvent.setup()
        renderModal()
        await user.click(screen.getByRole('button', { name: /save journal/i }))
        // After resolved, button should read "Saved!" and be disabled
        expect(await screen.findByRole('button', { name: /saved!/i })).toBeDisabled()
    })

    it('save button remains disabled after "Saved!" so it cannot be clicked again', async () => {
        const user = userEvent.setup()
        const { onSave } = renderModal()
        await user.click(screen.getByRole('button', { name: /save journal/i }))
        const savedBtn = await screen.findByRole('button', { name: /saved!/i })
        await user.click(savedBtn)
        expect(onSave).toHaveBeenCalledTimes(1) // still only called once
    })
})
