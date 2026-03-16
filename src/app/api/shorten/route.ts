import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import pool, { initDb } from '@/lib/db'

let dbInitialized = false

export async function POST(request: NextRequest) {
  if (!dbInitialized) {
    await initDb()
    dbInitialized = true
  }

  const { url } = await request.json()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  const shortCode = nanoid(7)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const result = await pool.query(
      'INSERT INTO urls (short_code, original_url) VALUES ($1, $2) RETURNING *',
      [shortCode, url]
    )
    const data = result.rows[0]

    return NextResponse.json({
      id: data.id,
      shortCode: data.short_code,
      shortUrl: `${appUrl}/${data.short_code}`,
      originalUrl: data.original_url,
      createdAt: data.created_at
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create short URL:', error)
    return NextResponse.json({ error: 'Failed to create short URL' }, { status: 500 })
  }
}
