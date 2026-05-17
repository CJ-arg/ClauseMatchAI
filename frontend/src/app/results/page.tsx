'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContractChangeOutput } from '@/types'

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<ContractChangeOutput | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('clausematch_result')
    if (!raw) { router.replace('/'); return }
    setResult(JSON.parse(raw))
  }, [])

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
    <main className="flex-1 px-[var(--grid-margin)] py-16 max-w-5xl">
      <div className="border-b border-foreground pb-4 mb-12 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Analysis Report
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Amendment Diff</h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={downloadJson}
            className="text-xs tracking-[0.15em] uppercase px-4 py-2 border border-border
                       hover:border-foreground transition-colors"
          >
            Download JSON
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-xs tracking-[0.15em] uppercase px-4 py-2 bg-[#E04038] text-white
                       hover:opacity-90 transition-opacity"
          >
            Analyze another
          </button>
        </div>
      </div>

      <div>
        <ReportRow label="Sections Changed">
          {result.sections_changed.length > 0
            ? <div className="flex flex-wrap gap-2">
                {result.sections_changed.map((item) => (
                  <span key={item} className="text-xs tracking-[0.1em] uppercase border border-foreground px-2 py-1">
                    {item}
                  </span>
                ))}
              </div>
            : <span className="text-sm text-muted-foreground">No sections identified</span>
          }
        </ReportRow>

        <ReportRow label="Topics Touched">
          {result.topics_touched.length > 0
            ? <div className="flex flex-wrap gap-2">
                {result.topics_touched.map((item) => (
                  <span key={item} className="text-xs tracking-[0.1em] uppercase border border-border px-2 py-1 text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
            : <span className="text-sm text-muted-foreground">No topics identified</span>
          }
        </ReportRow>

        <ReportRow label="Summary">
          <p className="text-sm text-foreground leading-relaxed">{result.summary_of_the_change}</p>
        </ReportRow>
      </div>
    </main>
  )
}

function ReportRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[3fr_9fr] gap-[var(--grid-gutter)] border-t border-border py-8">
      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium pt-0.5">
        {label}
      </p>
      <div>{children}</div>
    </div>
  )
}
