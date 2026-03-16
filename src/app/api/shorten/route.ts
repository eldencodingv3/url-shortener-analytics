import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  const { url } = await request.json()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  const shortCode = nanoid(7)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('urls')
    .insert({ short_code: shortCode, original_url: url })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create short URL' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return NextResponse.json({
    id: data.id,
    shortCode: data.short_code,
    shortUrl: `${appUrl}/${data.short_code}`,
    originalUrl: data.original_url,
    createdAt: data.created_at
  }, { status: 201 })
}
