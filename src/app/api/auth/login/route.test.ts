import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignInWithPassword = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { signInWithPassword: mockSignInWithPassword },
  }),
  createServiceClient: vi.fn(),
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with user on success', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' }
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user).toEqual(mockUser)
  })

  it('returns 401 on invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
