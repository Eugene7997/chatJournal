/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth/auth0'
import query from '@/lib/db/db'
import { POST } from '@/api/chat/journal/route'

jest.mock('@/lib/auth/auth0', () => ({ auth0: { getSession: jest.fn() } }))
jest.mock('@/lib/db/db', () => ({ __esModule: true, default: jest.fn() }))

const mockGetSession = auth0.getSession as jest.Mock
const mockQuery = query as jest.Mock
const fakeSession = { user: { sub: 'auth0|user-123' } }

const fakeMessages = [
    { role: 'user', content: 'I went for a run.', created_at: '2024-01-15T09:00:00.000Z' },
    { role: 'assistant', content: 'Nice! How far did you go?', created_at: '2024-01-15T09:01:00.000Z' },
]

const fakeLLMResponse = {
    choices: [{
        message: {
            content: 'Title: My Morning Run\n\nDate: Monday, January 15, 2024\n\n09:00 - Entry: Went for a run.\n\nFeelings: Energized and motivated.',
        },
    }],
}

function makeReq(body: object) {
    return new NextRequest('http://localhost:3000/api/chat/journal', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
    })
}

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

describe('POST /api/chat/journal', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await POST(makeReq({ sessionId: 's-1' }))
        expect(res.status).toBe(401)
    })

    it('returns 400 when sessionId is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await POST(makeReq({}))
        expect(res.status).toBe(400)
    })

    it('returns 404 when no messages exist for the session', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        const res = await POST(makeReq({ sessionId: 's-1' }))
        expect(res.status).toBe(404)
    })

    it('returns 200 with title and content on success', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: fakeMessages })
        jest.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify(fakeLLMResponse), { status: 200 })
        )

        const res = await POST(makeReq({ sessionId: 's-1' }))
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.title).toBe('My Morning Run')
        expect(body.content).toBeDefined()
        expect(body.content).not.toContain('Title:')
    })

    it('sends the conversation history to the LLM', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: fakeMessages })
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify(fakeLLMResponse), { status: 200 })
        )

        await POST(makeReq({ sessionId: 's-1' }))

        const fetchBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
        // The user message in the payload should contain the conversation
        const userMsg = fetchBody.messages.find((m: { role: string }) => m.role === 'user')
        expect(userMsg.content).toContain('I went for a run.')
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await POST(makeReq({ sessionId: 's-1' }))
        expect(res.status).toBe(500)
    })

    it('returns 500 when the LLM request fails', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: fakeMessages })
        jest.spyOn(global, 'fetch').mockResolvedValue(
            new Response('Bad Gateway', { status: 502 })
        )

        const res = await POST(makeReq({ sessionId: 's-1' }))
        expect(res.status).toBe(500)
    })
})
