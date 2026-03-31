/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth/auth0'
import query from '@/lib/db/db'
import { GET, POST, PATCH, DELETE } from '@/api/journals/route'

jest.mock('@/lib/auth/auth0', () => ({ auth0: { getSession: jest.fn() } }))
jest.mock('@/lib/db/db', () => ({ __esModule: true, default: jest.fn() }))

const mockGetSession = auth0.getSession as jest.Mock
const mockQuery = query as jest.Mock
const fakeSession = { user: { sub: 'auth0|user-123' } }

function makeReq(method: string, body: object) {
    return new NextRequest('http://localhost:3000/api/journals', {
        method,
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
    })
}

beforeEach(() => jest.clearAllMocks())

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/journals', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await GET()
        expect(res.status).toBe(401)
    })

    it('returns journals list on success', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const fakeJournals = [{ id: 'j-1', title: 'My Day', content: '...', created_at: new Date().toISOString() }]
        mockQuery.mockResolvedValue({ rows: fakeJournals })
        const res = await GET()
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.journals).toEqual(fakeJournals)
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await GET()
        expect(res.status).toBe(500)
    })
})

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/journals', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await POST(makeReq('POST', { sessionId: 'sess-1', content: 'Content' }))
        expect(res.status).toBe(401)
    })

    it('returns 400 when sessionId is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await POST(makeReq('POST', { content: 'Content' }))
        expect(res.status).toBe(400)
    })

    it('returns 400 when content is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await POST(makeReq('POST', { sessionId: 'sess-1' }))
        expect(res.status).toBe(400)
    })

    it('creates journal and returns 201 with journal_id', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [{ id: 'journal-1' }] })
        const res = await POST(makeReq('POST', { sessionId: 'sess-1', title: 'My Day', content: 'Content' }))
        expect(res.status).toBe(201)
        const body = await res.json()
        expect(body.journal_id).toBe('journal-1')
    })

    it('uses empty string for title when not provided', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [{ id: 'j-1' }] })
        await POST(makeReq('POST', { sessionId: 'sess-1', content: 'Content' }))
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO journals'),
            ['sess-1', fakeSession.user.sub, '', 'Content']
        )
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await POST(makeReq('POST', { sessionId: 'sess-1', content: 'Content' }))
        expect(res.status).toBe(500)
    })
})

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /api/journals', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await DELETE(makeReq('DELETE', { journalId: 'j-1' }))
        expect(res.status).toBe(401)
    })

    it('returns 400 when neither journalId nor deleteAll is provided', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await DELETE(makeReq('DELETE', {}))
        expect(res.status).toBe(400)
    })

    it('deletes a single journal by id and returns 200', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        const res = await DELETE(makeReq('DELETE', { journalId: 'j-1' }))
        expect(res.status).toBe(200)
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM journals WHERE id'),
            ['j-1', fakeSession.user.sub]
        )
    })

    it('deletes all journals when deleteAll is true', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        const res = await DELETE(makeReq('DELETE', { deleteAll: true }))
        expect(res.status).toBe(200)
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM journals WHERE sub'),
            [fakeSession.user.sub]
        )
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await DELETE(makeReq('DELETE', { journalId: 'j-1' }))
        expect(res.status).toBe(500)
    })
})

// ─── PATCH ────────────────────────────────────────────────────────────────────

describe('PATCH /api/journals', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await PATCH(makeReq('PATCH', { journalId: 'j-1', title: 'T', content: 'C' }))
        expect(res.status).toBe(401)
    })

    it('returns 400 when journalId is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await PATCH(makeReq('PATCH', { title: 'T', content: 'C' }))
        expect(res.status).toBe(400)
    })

    it('returns 400 when content is missing', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        const res = await PATCH(makeReq('PATCH', { journalId: 'j-1', title: 'T' }))
        expect(res.status).toBe(400)
    })

    it('updates the journal and returns 200', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        const res = await PATCH(makeReq('PATCH', { journalId: 'j-1', title: 'New Title', content: 'New Content' }))
        expect(res.status).toBe(200)
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE journals'),
            ['New Title', 'New Content', 'j-1', fakeSession.user.sub]
        )
    })

    it('returns 500 on DB error', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await PATCH(makeReq('PATCH', { journalId: 'j-1', title: 'T', content: 'C' }))
        expect(res.status).toBe(500)
    })
})
