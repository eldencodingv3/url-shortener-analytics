import { NextResponse } from 'next/server'
import pool, { initDb } from '@/lib/db'

let dbInitialized = false

export async function GET() {
  if (!dbInitialized) {
    await initDb()
    dbInitialized = true
  }

  try {
    const result = await pool.query('SELECT * FROM urls ORDER BY created_at DESC')
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch URLs:', error)
    return NextResponse.json({ error: 'Failed to fetch URLs' }, { status: 500 })
  }
}
