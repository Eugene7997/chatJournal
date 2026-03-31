/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth/auth0'
import query from '@/lib/db/db'
import { GET, POST } from '@/api/chat/message/route'

jest.mock('@/lib/auth/auth0', () => ({ auth0: { getSession: jest.fn() } }))
jest.mock('@/lib/db/db', () => ({ __esModule: true, default: jest.fn() }))

const mockGetSession = auth0.getSession as jest.Mock
const mockQuery = query as jest.Mock
const fakeSession = { user: { sub: 'auth0|user-123' } }

// Realistic OpenRouter non-streaming response
const fakeOpenRouterResponse = {
    id: 'gen-abc123',
    model: 'google/gemini-2.5-flash-lite',
    provider: 'Google',
    choices: [{ message: { content: 'How was your day?' } }],
    usage: { prompt_tokens: 50, completion_tokens: 15, total_tokens: 65, cost: 0.0005 },
}

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/chat/message', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const req = new NextRequest('http://localhost:3000/api/chat/message?sessionId=s-1')
        const res = await GET(req)
        expect(res.status).toBe(401)
    })

    it('returns messages for the given sessionId', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const fakeMessages = [{ role: 'user', content: 'Hello' }]
        mockQuery.mockResolvedValue({ rows: fakeMessages })

        const req = new NextRequest('http://localhost:3000/api/chat/message?sessionId=s-1')
        const res = await GET(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.messages).toEqual(fakeMessages)
    })

    it('queries messages ordered by created_at for the given session', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })

        const req = new NextRequest('http://localhost:3000/api/chat/message?sessionId=s-1')
        await GET(req)
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('ORDER BY created_at'),
            ['s-1']
        )
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const req = new NextRequest('http://localhost:3000/api/chat/message?sessionId=s-1')
        const res = await GET(req)
        expect(res.status).toBe(500)
    })
})

// ─── POST (non-streaming) ─────────────────────────────────────────────────────

describe('POST /api/chat/message (stream: false)', () => {
    function makePostReq(body: object) {
        return new NextRequest('http://localhost:3000/api/chat/message', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'content-type': 'application/json' },
        })
    }

    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await POST(makePostReq({ message: 'Hi', role: 'user', stream: false }))
        expect(res.status).toBe(401)
    })

    it('returns 400 when message is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await POST(makePostReq({ role: 'user', stream: false }))
        expect(res.status).toBe(400)
    })

    it('returns 400 when role is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await POST(makePostReq({ message: 'Hi', stream: false }))
        expect(res.status).toBe(400)
    })

    it('calls OpenRouter and returns the LLM response', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        // History query, then user message insert, then assistant insert, then usage insert
        mockQuery
            .mockResolvedValueOnce({ rows: [] })           // history fetch
            .mockResolvedValueOnce({ rows: [] })           // user message insert
            .mockResolvedValueOnce({ rows: [{ id: 'msg-1' }] }) // assistant insert
            .mockResolvedValueOnce({ rows: [] })           // usage insert

        jest.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify(fakeOpenRouterResponse), { status: 200 })
        )

        const res = await POST(makePostReq({ message: 'Hello', role: 'user', stream: false, sessionId: 's-1' }))
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.data).toBeDefined()
    })

    it('includes conversation history in the OpenRouter payload', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const historyRows = [
            { role: 'user', content: 'Good morning' },
            { role: 'assistant', content: 'Good morning! How are you?' },
        ]
        mockQuery
            .mockResolvedValueOnce({ rows: historyRows })  // history
            .mockResolvedValue({ rows: [{ id: 'msg-1' }] })

        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify(fakeOpenRouterResponse), { status: 200 })
        )

        await POST(makePostReq({ message: 'Fine thanks', role: 'user', stream: false, sessionId: 's-1' }))

        const fetchBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string)
        expect(fetchBody.messages).toEqual(expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'Good morning' }),
            expect.objectContaining({ role: 'assistant', content: 'Good morning! How are you?' }),
            expect.objectContaining({ role: 'user', content: 'Fine thanks' }),
        ]))
    })

    it('returns 500 when OpenRouter fetch throws', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network error'))

        const res = await POST(makePostReq({ message: 'Hi', role: 'user', stream: false }))
        expect(res.status).toBe(500)
    })
})

// ─── POST (streaming) ─────────────────────────────────────────────────────────

describe('POST /api/chat/message (stream: true)', () => {
    it('returns a text/event-stream response', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })

        const encoder = new TextEncoder()
        const fakeStream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n'))
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
            },
        })
        jest.spyOn(global, 'fetch').mockResolvedValue(
            new Response(fakeStream, { status: 200 })
        )

        const req = new NextRequest('http://localhost:3000/api/chat/message', {
            method: 'POST',
            body: JSON.stringify({ message: 'Hi', role: 'user', stream: true }),
            headers: { 'content-type': 'application/json' },
        })
        const res = await POST(req)
        expect(res.headers.get('content-type')).toContain('text/event-stream')
    })
})
