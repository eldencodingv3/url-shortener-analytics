'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface UrlEntry {
  id: string
  short_code: string
  original_url: string
  click_count: number
  created_at: string
}

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUrls() {
      try {
        const res = await fetch('/api/urls')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch URLs')
        setUrls(data.urls ?? data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchUrls()
  }, [])

  function truncateUrl(url: string, max = 50) {
    return url.length > max ? url.slice(0, max) + '...' : url
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            All your shortened URLs and their performance
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && urls.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">
              No URLs shortened yet.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Shorten your first URL &rarr;
            </Link>
          </div>
        )}

        {!loading && !error && urls.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                    <th className="px-6 py-3">Short Code</th>
                    <th className="px-6 py-3">Original URL</th>
                    <th className="px-6 py-3 text-right">Clicks</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {urls.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {entry.short_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {truncateUrl(entry.original_url)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {entry.click_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/${entry.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          Analytics &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-gray-200 md:hidden dark:divide-gray-800">
              {urls.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/dashboard/${entry.id}`}
                  className="block px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {entry.short_code}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {entry.click_count} clicks
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm text-gray-500 dark:text-gray-400">
                    {entry.original_url}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(entry.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
