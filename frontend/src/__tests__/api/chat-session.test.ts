/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth/auth0'
import query from '@/lib/db/db'
import { GET, POST, PATCH, DELETE } from '@/api/chat/chat_session/route'

jest.mock('@/lib/auth/auth0', () => ({ auth0: { getSession: jest.fn() } }))
jest.mock('@/lib/db/db', () => ({ __esModule: true, default: jest.fn() }))

const mockGetSession = auth0.getSession as jest.Mock
const mockQuery = query as jest.Mock
const fakeSession = { user: { sub: 'auth0|user-123' } }

function makeReq(method: string, body: object) {
    return new NextRequest('http://localhost:3000/api/chat/chat_session', {
        method,
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
    })
}

beforeEach(() => jest.clearAllMocks())

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/chat/chat_session', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await GET()
        expect(res.status).toBe(401)
    })

    it('returns the list of sessions on success', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [{ id: 'sess-1', name: 'My Day' }] })
        const res = await GET()
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.sessions).toEqual([{ id: 'sess-1', name: 'My Day' }])
    })

    it('returns null for sessions with no name', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [{ id: 'sess-1', name: null }] })
        const res = await GET()
        const body = await res.json()
        expect(body.sessions[0].name).toBeNull()
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('connection refused'))
        const res = await GET()
        expect(res.status).toBe(500)
    })
})

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/chat/chat_session', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await POST()
        expect(res.status).toBe(401)
    })

    it('creates a session and returns its id', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [{ id: 'new-sess-id' }] })
        const res = await POST()
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.chat_session_id).toBe('new-sess-id')
    })

    it('queries with the authenticated user sub', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [{ id: 'x' }] })
        await POST()
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO chat_sessions'),
            [fakeSession.user.sub]
        )
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await POST()
        expect(res.status).toBe(500)
    })
})

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /api/chat/chat_session', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await DELETE(makeReq('DELETE', { sessionId: 'sess-1' }))
        expect(res.status).toBe(401)
    })

    it('returns 400 when sessionId is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await DELETE(makeReq('DELETE', {}))
        expect(res.status).toBe(400)
    })

    it('deletes the session and returns 200', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        const res = await DELETE(makeReq('DELETE', { sessionId: 'sess-1' }))
        expect(res.status).toBe(200)
    })

    it('scopes the delete to the authenticated user', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        await DELETE(makeReq('DELETE', { sessionId: 'sess-1' }))
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM chat_sessions'),
            ['sess-1', fakeSession.user.sub]
        )
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await DELETE(makeReq('DELETE', { sessionId: 'sess-1' }))
        expect(res.status).toBe(500)
    })
})

// ─── PATCH ────────────────────────────────────────────────────────────────────

describe('PATCH /api/chat/chat_session', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await PATCH(makeReq('PATCH', { sessionId: 'sess-1', name: 'New Name' }))
        expect(res.status).toBe(401)
    })

    it('returns 400 when sessionId is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await PATCH(makeReq('PATCH', { name: 'New Name' }))
        expect(res.status).toBe(400)
    })

    it('returns 400 when name is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await PATCH(makeReq('PATCH', { sessionId: 'sess-1' }))
        expect(res.status).toBe(400)
    })

    it('renames the session and returns 200', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        const res = await PATCH(makeReq('PATCH', { sessionId: 'sess-1', name: 'New Name' }))
        expect(res.status).toBe(200)
    })

    it('passes the new name and user sub to the DB', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        await PATCH(makeReq('PATCH', { sessionId: 'sess-1', name: 'New Name' }))
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE chat_sessions'),
            ['New Name', 'sess-1', fakeSession.user.sub]
        )
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await PATCH(makeReq('PATCH', { sessionId: 'sess-1', name: 'New Name' }))
        expect(res.status).toBe(500)
    })
})
