/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth/auth0'
import query from '@/lib/db/db'
import { POST } from '@/api/chat/save_message/route'

jest.mock('@/lib/auth/auth0', () => ({ auth0: { getSession: jest.fn() } }))
jest.mock('@/lib/db/db', () => ({ __esModule: true, default: jest.fn() }))

const mockGetSession = auth0.getSession as jest.Mock
const mockQuery = query as jest.Mock
const fakeSession = { user: { sub: 'auth0|user-123' } }

function makeReq(body: object) {
    return new NextRequest('http://localhost:3000/api/chat/save_message', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
    })
}

beforeEach(() => jest.clearAllMocks())

describe('POST /api/chat/save_message', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await POST(makeReq({ sessionId: 's-1', role: 'user', content: 'Hello' }))
        expect(res.status).toBe(401)
    })

    it('returns 400 when sessionId is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await POST(makeReq({ role: 'user', content: 'Hello' }))
        expect(res.status).toBe(400)
    })

    it('returns 400 when role is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await POST(makeReq({ sessionId: 's-1', content: 'Hello' }))
        expect(res.status).toBe(400)
    })

    it('returns 400 when content is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await POST(makeReq({ sessionId: 's-1', role: 'user' }))
        expect(res.status).toBe(400)
    })

    it('saves the message and returns 201 with message_id', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        // First query: insert chat_message → returns id
        mockQuery.mockResolvedValue({ rows: [{ id: 'msg-1' }] })

        const res = await POST(makeReq({ sessionId: 's-1', role: 'user', content: 'Hello' }))
        expect(res.status).toBe(201)
        const body = await res.json()
        expect(body.message_id).toBe('msg-1')
    })

    it('only inserts into chat_messages when no usage data is provided', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [{ id: 'msg-1' }] })

        await POST(makeReq({ sessionId: 's-1', role: 'user', content: 'Hello' }))
        // Only one DB call — no usage insert
        expect(mockQuery).toHaveBeenCalledTimes(1)
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO chat_messages'),
            expect.any(Array)
        )
    })

    it('also inserts into chat_completion_usage when usage data is provided', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        // First call: insert message; second call: insert usage
        mockQuery
            .mockResolvedValueOnce({ rows: [{ id: 'msg-1' }] })
            .mockResolvedValueOnce({ rows: [] })

        const res = await POST(makeReq({
            sessionId: 's-1',
            role: 'assistant',
            content: 'Hi there!',
            openrouterId: 'gen-abc',
            provider: 'Google',
            promptTokens: 50,
            completionTokens: 20,
            totalTokens: 70,
            cost: 0.001,
        }))

        expect(res.status).toBe(201)
        expect(mockQuery).toHaveBeenCalledTimes(2)
        expect(mockQuery).toHaveBeenNthCalledWith(2,
            expect.stringContaining('INSERT INTO chat_completion_usage'),
            expect.arrayContaining(['msg-1', 'gen-abc', 'Google'])
        )
    })

    it('defaults messageType to "text" when not provided', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [{ id: 'msg-1' }] })

        await POST(makeReq({ sessionId: 's-1', role: 'user', content: 'Hello' }))
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO chat_messages'),
            expect.arrayContaining(['text'])
        )
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await POST(makeReq({ sessionId: 's-1', role: 'user', content: 'Hello' }))
        expect(res.status).toBe(500)
    })
})
