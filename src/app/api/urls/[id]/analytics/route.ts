import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServiceClient()

  // Fetch URL details
  const { data: urlData, error: urlError } = await supabase
    .from('urls')
    .select('*')
    .eq('id', id)
    .single()

  if (urlError || !urlData) {
    return NextResponse.json({ error: 'URL not found' }, { status: 404 })
  }

  // Fetch all clicks for this URL
  const { data: clicks, error: clicksError } = await supabase
    .from('clicks')
    .select('*')
    .eq('url_id', id)
    .order('clicked_at', { ascending: false })

  if (clicksError) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }

  const clickList = clicks || []

  // Build summary: clicks by referrer
  const byReferrer: Record<string, number> = {}
  const byDeviceType: Record<string, number> = {}
  const byBrowser: Record<string, number> = {}
  const byDay: Record<string, number> = {}

  for (const click of clickList) {
    const ref = click.referrer || 'Direct'
    byReferrer[ref] = (byReferrer[ref] || 0) + 1

    const device = click.device_type || 'Unknown'
    byDeviceType[device] = (byDeviceType[device] || 0) + 1

    const browser = click.browser || 'Unknown'
    byBrowser[browser] = (byBrowser[browser] || 0) + 1

    const day = click.clicked_at ? click.clicked_at.split('T')[0] : 'Unknown'
    byDay[day] = (byDay[day] || 0) + 1
  }

  // Build timeline for last 30 days
  const timeline: { date: string; clicks: number }[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    timeline.push({ date: dateStr, clicks: byDay[dateStr] || 0 })
  }

  return NextResponse.json({
    url: {
      id: urlData.id,
      shortCode: urlData.short_code,
      originalUrl: urlData.original_url,
      clickCount: urlData.click_count,
      createdAt: urlData.created_at,
    },
    clicks: clickList,
    summary: {
      byReferrer,
      byDeviceType,
      byBrowser,
    },
    timeline,
  })
}
