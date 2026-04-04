import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatSideBar from '@/components/ChatSideBar'
import type { ChatSession } from '@/lib/types/types'

const sessions: ChatSession[] = [
    { id: 'sess-1', name: 'Morning Reflection' },
    { id: 'sess-2', name: 'Evening Notes' },
    { id: 'sess-3', name: null },
]

function renderSidebar(overrides: Partial<React.ComponentProps<typeof ChatSideBar>> = {}) {
    const props = {
        sessions,
        onItemClick: jest.fn(),
        onNewSession: jest.fn(),
        onDeleteSession: jest.fn(),
        onRenameSession: jest.fn(),
        loading: false,
        ...overrides,
    }
    render(<ChatSideBar {...props} />)
    return props
}

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('ChatSideBar rendering', () => {
    it('renders the "Sessions" heading', () => {
        renderSidebar()
        expect(screen.getByText('Sessions')).toBeInTheDocument()
    })

    it('renders each session by name', () => {
        renderSidebar()
        expect(screen.getByText('Morning Reflection')).toBeInTheDocument()
        expect(screen.getByText('Evening Notes')).toBeInTheDocument()
    })

    it('falls back to session.id when name is null', () => {
        renderSidebar()
        expect(screen.getByText('sess-3')).toBeInTheDocument()
    })

    it('shows a loading spinner and no list when loading=true', () => {
        renderSidebar({ loading: true })
        expect(screen.queryByText('Morning Reflection')).not.toBeInTheDocument()
    })

    it('renders an empty list without crashing when sessions is empty', () => {
        renderSidebar({ sessions: [] })
        expect(screen.getByText('Sessions')).toBeInTheDocument()
    })
})

// ─── New session button ───────────────────────────────────────────────────────

describe('ChatSideBar new session button', () => {
    it('calls onNewSession when the "+" button is clicked', async () => {
        const user = userEvent.setup()
        const { onNewSession } = renderSidebar()
        await user.click(screen.getByRole('button', { name: /new conversation/i }))
        expect(onNewSession).toHaveBeenCalledTimes(1)
    })
})

// ─── Session item click ───────────────────────────────────────────────────────

describe('ChatSideBar session item click', () => {
    it('calls onItemClick with the correct session id', async () => {
        const user = userEvent.setup()
        const { onItemClick } = renderSidebar()
        await user.click(screen.getByText('Morning Reflection'))
        expect(onItemClick).toHaveBeenCalledWith('sess-1')
    })

    it('does not call onItemClick while a rename is in progress for that session', async () => {
        const user = userEvent.setup()
        const { onItemClick } = renderSidebar()

        // Open the dropdown for sess-1 and click Rename
        const [menuBtn] = screen.getAllByRole('button', { name: /session options/i })
        await user.click(menuBtn)
        await user.click(screen.getByText('Rename'))

        // Now clicking on the session row should be a no-op
        const input = screen.getByRole('textbox')
        await user.click(input) // click inside the input (stops propagation, no navigation)
        expect(onItemClick).not.toHaveBeenCalled()
    })
})

// ─── Dropdown menu ────────────────────────────────────────────────────────────

describe('ChatSideBar dropdown menu', () => {
    it('shows the dropdown for the clicked session', async () => {
        const user = userEvent.setup()
        renderSidebar()
        const menuButtons = screen.getAllByRole('button', { name: /session options/i })
        await user.click(menuButtons[0])
        expect(screen.getByText('Rename')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('shows only one dropdown at a time', async () => {
        const user = userEvent.setup()
        renderSidebar()
        const [btn1, btn2] = screen.getAllByRole('button', { name: /session options/i })
        await user.click(btn1)
        expect(screen.getAllByText('Rename')).toHaveLength(1)
        await user.click(btn2)
        expect(screen.getAllByText('Rename')).toHaveLength(1)
    })

    it('closes the dropdown when clicking outside', async () => {
        const user = userEvent.setup()
        renderSidebar()
        const [menuBtn] = screen.getAllByRole('button', { name: /session options/i })
        await user.click(menuBtn)
        expect(screen.getByText('Rename')).toBeInTheDocument()

        // Click outside (on the document body) — triggers the document click listener
        await user.click(document.body)
        expect(screen.queryByText('Rename')).not.toBeInTheDocument()
    })

    it('calls onDeleteSession when Delete is clicked', async () => {
        const user = userEvent.setup()
        const { onDeleteSession } = renderSidebar()
        const [menuBtn] = screen.getAllByRole('button', { name: /session options/i })
        await user.click(menuBtn)
        await user.click(screen.getByText('Delete'))
        expect(onDeleteSession).toHaveBeenCalledWith('sess-1')
    })
})

// ─── Rename flow ──────────────────────────────────────────────────────────────

describe('ChatSideBar rename flow', () => {
    async function openRename() {
        const user = userEvent.setup()
        const { onRenameSession } = renderSidebar()
        const [menuBtn] = screen.getAllByRole('button', { name: /session options/i })
        await user.click(menuBtn)
        await user.click(screen.getByText('Rename'))
        return { user, onRenameSession }
    }

    it('shows an inline input pre-filled with the current name when Rename is clicked', async () => {
        await openRename()
        const input = screen.getByRole('textbox') as HTMLInputElement
        expect(input).toBeInTheDocument()
        expect(input.value).toBe('Morning Reflection')
    })

    it('commits the rename on Enter and calls onRenameSession', async () => {
        const { user, onRenameSession } = await openRename()
        const input = screen.getByRole('textbox')
        await user.clear(input)
        await user.type(input, 'New Name')
        await user.keyboard('{Enter}')
        expect(onRenameSession).toHaveBeenCalledWith('sess-1', 'New Name')
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('cancels on Escape without calling onRenameSession', async () => {
        const { user, onRenameSession } = await openRename()
        await user.keyboard('{Escape}')
        expect(onRenameSession).not.toHaveBeenCalled()
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('cancels the rename on blur without calling onRenameSession', async () => {
        const { user, onRenameSession } = await openRename()
        const input = screen.getByRole('textbox')
        await user.clear(input)
        await user.type(input, 'Blurred Name')
        await user.tab() // moves focus away, triggering blur
        expect(onRenameSession).not.toHaveBeenCalled()
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('does not call onRenameSession when the trimmed value is empty', async () => {
        const { user, onRenameSession } = await openRename()
        const input = screen.getByRole('textbox')
        await user.clear(input)
        await user.keyboard('{Enter}')
        expect(onRenameSession).not.toHaveBeenCalled()
    })
})
