import { NextRequest, NextResponse } from 'next/server'
import pool, { initDb } from '@/lib/db'

let dbInitialized = false

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!dbInitialized) {
    await initDb()
    dbInitialized = true
  }

  const { id } = await params

  try {
    // Get URL details
    const urlResult = await pool.query('SELECT * FROM urls WHERE id = $1', [id])
    if (urlResult.rows.length === 0) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 })
    }
    const urlData = urlResult.rows[0]

    // Get all clicks
    const clicksResult = await pool.query(
      'SELECT * FROM clicks WHERE url_id = $1 ORDER BY clicked_at DESC',
      [id]
    )

    // Clicks by referrer
    const referrerResult = await pool.query(
      `SELECT COALESCE(NULLIF(referrer, ''), 'Direct') as referrer, COUNT(*)::int as count
       FROM clicks WHERE url_id = $1 GROUP BY referrer ORDER BY count DESC LIMIT 10`,
      [id]
    )

    // Clicks by device
    const deviceResult = await pool.query(
      `SELECT COALESCE(device_type, 'desktop') as device_type, COUNT(*)::int as count
       FROM clicks WHERE url_id = $1 GROUP BY device_type ORDER BY count DESC`,
      [id]
    )

    // Clicks by browser
    const browserResult = await pool.query(
      `SELECT COALESCE(browser, 'Unknown') as browser, COUNT(*)::int as count
       FROM clicks WHERE url_id = $1 GROUP BY browser ORDER BY count DESC LIMIT 10`,
      [id]
    )

    // Timeline (last 30 days)
    const timelineResult = await pool.query(
      `SELECT DATE(clicked_at) as date, COUNT(*)::int as count
       FROM clicks WHERE url_id = $1 AND clicked_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(clicked_at) ORDER BY date ASC`,
      [id]
    )

    return NextResponse.json({
      url: urlData,
      clicks: clicksResult.rows,
      summary: {
        totalClicks: urlData.click_count,
        byReferrer: referrerResult.rows,
        byDevice: deviceResult.rows,
        byBrowser: browserResult.rows,
      },
      timeline: timelineResult.rows,
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
