import { describe, it, expect, vi, beforeEach } from 'vitest'

// next/headers mock
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}))

// @supabase/ssr mock
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({ auth: {}, from: vi.fn() }),
}))

describe('Supabase server clients', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key')
  })

  it('createClient returns a Supabase client instance', async () => {
    const { createClient } = await import('./server')
    const client = await createClient()
    expect(client).toBeDefined()
  })

  it('createServiceClient uses SUPABASE_SERVICE_ROLE_KEY', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { createServiceClient } = await import('./server')

    await createServiceClient()

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'service-role-key',
      expect.any(Object)
    )
  })

  it('createClient uses NEXT_PUBLIC_SUPABASE_ANON_KEY', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { createClient } = await import('./server')

    await createClient()

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'anon-key',
      expect.any(Object)
    )
  })
})
