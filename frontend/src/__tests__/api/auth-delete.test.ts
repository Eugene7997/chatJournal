/**
 * @jest-environment node
 */
import { auth0 } from '@/lib/auth/auth0'
import query from '@/lib/db/db'
import { DELETE } from '@/api/auth/delete/route'

jest.mock('@/lib/auth/auth0', () => ({ auth0: { getSession: jest.fn() } }))
jest.mock('@/lib/db/db', () => ({ __esModule: true, default: jest.fn() }))

const mockGetSession = auth0.getSession as jest.Mock
const mockQuery = query as jest.Mock
const fakeSession = { user: { sub: 'auth0|user-123' } }

// Successful Auth0 M2M token exchange response
const fakeTokenResponse = { access_token: 'test-management-token' }

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

describe('DELETE /api/auth/delete', () => {
    it('returns 401 when not authenticated', async () => {
        mockGetSession.mockResolvedValue(null)
        const res = await DELETE()
        expect(res.status).toBe(401)
    })

    it('returns 500 when DB deletion fails', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockRejectedValue(new Error('DB error'))
        const res = await DELETE()
        expect(res.status).toBe(500)
    })

    it('returns 500 when Auth0 M2M token fetch fails', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network error'))
        const res = await DELETE()
        expect(res.status).toBe(500)
    })

    it('deletes the user from DB before calling Auth0', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        jest.spyOn(global, 'fetch')
            .mockResolvedValueOnce(new Response(JSON.stringify(fakeTokenResponse), { status: 200 }))
            .mockResolvedValueOnce(new Response(null, { status: 204 }))

        await DELETE()
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM users'),
            [fakeSession.user.sub]
        )
    })

    it('returns 200 on full successful deletion', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        jest.spyOn(global, 'fetch')
            // Auth0 M2M token exchange
            .mockResolvedValueOnce(new Response(JSON.stringify(fakeTokenResponse), { status: 200 }))
            // Auth0 Management API user delete
            .mockResolvedValueOnce(new Response(null, { status: 204 }))

        const res = await DELETE()
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.message).toBe('successfully deleted')
    })

    it('calls the Auth0 Management API with the user sub in the URL', async () => {
        mockGetSession.mockResolvedValue(fakeSession)
        mockQuery.mockResolvedValue({ rows: [] })
        const mockFetch = jest.spyOn(global, 'fetch')
            .mockResolvedValueOnce(new Response(JSON.stringify(fakeTokenResponse), { status: 200 }))
            .mockResolvedValueOnce(new Response(null, { status: 204 }))

        await DELETE()

        const managementApiCall = mockFetch.mock.calls[1]
        const url = managementApiCall[0] as string
        expect(url).toContain(encodeURIComponent(fakeSession.user.sub))
        expect((managementApiCall[1] as RequestInit).method).toBe('DELETE')
    })
})
