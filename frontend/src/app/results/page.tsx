'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContractChangeOutput } from '@/types'

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<ContractChangeOutput | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('clausematch_result')
    if (!raw) { router.replace('/'); return }
    setResult(JSON.parse(raw))
  }, [router])

  if (!result) return null

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clausematch-report.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analysis Report</h1>
        <div className="flex gap-3">
          <button
            onClick={downloadJson}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Download JSON
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Analyze another
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sections Changed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.sections_changed.length > 0
            ? result.sections_changed.map((s) => (
                <Badge key={s} variant="secondary" className="text-sm">{s}</Badge>
              ))
            : <span className="text-sm text-gray-400">No sections identified</span>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Topics Touched</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.topics_touched.length > 0
            ? result.topics_touched.map((t) => (
                <Badge key={t} variant="outline" className="text-sm">{t}</Badge>
              ))
            : <span className="text-sm text-gray-400">No topics identified</span>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary of Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">{result.summary_of_the_change}</p>
        </CardContent>
      </Card>
    </main>
  )
}
