import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { email, password, nickname, university } = await req.json()

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Registration failed' }, { status: 409 })
  }

  const serviceClient = await createServiceClient()
  const { error: profileError } = await serviceClient
    .from('profiles')
    .insert({
      id: data.user.id,
      nickname,
      university,
      verified: false,
      role: 'user',
    })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ user: data.user }, { status: 201 })
}
