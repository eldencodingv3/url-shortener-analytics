import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { UAParser } from 'ua-parser-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params
  const supabase = createServiceClient()

  const { data: urlData, error } = await supabase
    .from('urls')
    .select('*')
    .eq('short_code', shortCode)
    .single()

  if (error || !urlData) {
    return NextResponse.json({ error: 'URL not found' }, { status: 404 })
  }

  // Parse user agent
  const userAgent = request.headers.get('user-agent') || ''
  const parsed = UAParser(userAgent)
  const browser = parsed.browser.name || 'Unknown'
  const deviceType = parsed.device.type || 'desktop'

  // Fire-and-forget click logging
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const referrer = request.headers.get('referer') || ''

  supabase.from('clicks').insert({
    url_id: urlData.id,
    ip_address: ip,
    user_agent: userAgent,
    referrer: referrer,
    device_type: deviceType,
    browser: browser,
  }).then(() => {})

  return NextResponse.redirect(urlData.original_url, { status: 301 })
}
