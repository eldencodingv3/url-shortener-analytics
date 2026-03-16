'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

interface UrlDetails {
  id: string
  short_code: string
  original_url: string
  click_count: number
  created_at: string
}

interface ClickOverTime {
  date: string
  clicks: number
}

interface BrowserData {
  browser: string
  clicks: number
}

interface DeviceData {
  device: string
  clicks: number
}

interface ReferrerData {
  referrer: string
  clicks: number
}

interface AnalyticsData {
  url: UrlDetails
  clicksOverTime: ClickOverTime[]
  browsers: BrowserData[]
  devices: DeviceData[]
  referrers: ReferrerData[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9']

export default function AnalyticsPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/urls/${id}/analytics`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch analytics')
        setData(json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [id])

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-500 dark:text-gray-400">Loading analytics...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-65px)] bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  if (!data) return null

  const { url, clicksOverTime, browsers, devices, referrers } = data
  const shortLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${url.short_code}`

  return (
    <main className="min-h-[calc(100vh-65px)] bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          &larr; Back to Dashboard
        </Link>

        {/* URL details header */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {shortLink}
              </h1>
              <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                {url.original_url}
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {url.click_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Clicks
              </div>
            </div>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Clicks over time */}
          <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Clicks Over Time
            </h2>
            {clicksOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clicksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(val: string) => {
                      const d = new Date(val)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-400">
                No click data yet
              </div>
            )}
          </div>

          {/* Browsers chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Browsers
            </h2>
            {browsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={browsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="browser" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-400">
                No browser data yet
              </div>
            )}
          </div>

          {/* Devices chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Devices
            </h2>
            {devices.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={devices}
                    dataKey="clicks"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(props: PieLabelRenderProps) => {
                      const name = String(props.name ?? '')
                      const pct = typeof props.percent === 'number' ? (props.percent * 100).toFixed(0) : '0'
                      return `${name} ${pct}%`
                    }}
                  >
                    {devices.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-400">
                No device data yet
              </div>
            )}
          </div>

          {/* Referrers table */}
          <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Top Referrers
            </h2>
            {referrers.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <th className="pb-3">Referrer</th>
                    <th className="pb-3 text-right">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {referrers.map((ref, i) => (
                    <tr key={i}>
                      <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                        {ref.referrer || 'Direct'}
                      </td>
                      <td className="py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {ref.clicks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-gray-400">
                No referrer data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
