import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignUp = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { signUp: mockSignUp },
  }),
  createServiceClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ insert: mockInsert })
  })

  it('returns 201 with user on success', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' }
    mockSignUp.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockInsert.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        nickname: '테스트',
        university: '서울대학교',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.user).toEqual(mockUser)
  })

  it('returns 409 on duplicate email', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'password123',
        nickname: '테스트',
        university: '서울대학교',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('inserts profile via createServiceClient', async () => {
    const mockUser = { id: 'user-id', email: 'test@example.com' }
    mockSignUp.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockInsert.mockResolvedValue({ error: null })

    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        nickname: '테스트',
        university: '서울대학교',
      }),
    })

    await POST(req)
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-id',
        nickname: '테스트',
        university: '서울대학교',
        verified: false,
        role: 'user',
      })
    )
  })
})
