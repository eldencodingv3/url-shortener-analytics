import { NextRequest, NextResponse } from 'next/server'
import pool, { initDb } from '@/lib/db'
import { UAParser } from 'ua-parser-js'

let dbInitialized = false

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  if (!dbInitialized) {
    await initDb()
    dbInitialized = true
  }

  const { shortCode } = await params

  try {
    const result = await pool.query('SELECT * FROM urls WHERE short_code = $1', [shortCode])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 })
    }

    const urlData = result.rows[0]

    // Parse user agent
    const userAgent = request.headers.get('user-agent') || ''
    const parsed = UAParser(userAgent)
    const browser = parsed.browser.name || 'Unknown'
    const deviceType = parsed.device.type || 'desktop'

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const referrer = request.headers.get('referer') || ''

    // Fire-and-forget click logging
    pool.query(
      `INSERT INTO clicks (url_id, ip_address, user_agent, referrer, device_type, browser)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [urlData.id, ip, userAgent, referrer, deviceType, browser]
    ).catch((err: unknown) => console.error('Click logging error:', err))

    return NextResponse.redirect(urlData.original_url as string, { status: 301 })
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
