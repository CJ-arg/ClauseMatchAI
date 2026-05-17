'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { ContractChangeOutput } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function analyzeContracts(original: File, amendment: File): Promise<ContractChangeOutput> {
  const form = new FormData()
  form.append('original_file', original)
  form.append('amendment_file', amendment)

  const res = await fetch(`${API_URL}/api/v1/analyze`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `Server error ${res.status}`)
  }
  return res.json()
}

export default function UploadPage() {
  const router = useRouter()
  const originalRef = useRef<HTMLInputElement>(null)
  const amendmentRef = useRef<HTMLInputElement>(null)
  const [originalName, setOriginalName] = useState('')
  const [amendmentName, setAmendmentName] = useState('')

  const mutation = useMutation({
    mutationFn: () => {
      const original = originalRef.current?.files?.[0]
      const amendment = amendmentRef.current?.files?.[0]
      if (!original || !amendment) throw new Error('Please select both files.')
      return analyzeContracts(original, amendment)
    },
    onSuccess: (data) => {
      sessionStorage.setItem('clausematch_result', JSON.stringify(data))
      router.push('/results')
    },
  })

  return (
    <main className="flex-1 px-[var(--grid-margin)] py-16">
      <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-[var(--grid-gutter)] max-w-5xl">

        {/* Left column: brand info */}
        <div className="pt-1 space-y-6">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">
              Contract Analysis
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900">
              Detect every change.
            </h1>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Upload the original contract and its amendment. The AI pipeline extracts every
            addition, deletion, and modification — structured and ready to audit.
          </p>
          <p className="text-xs text-neutral-400">Supports PDF · DOCX · TXT</p>
        </div>

        {/* Right column: form */}
        <div className="space-y-0">
          <FileField
            label="Original Contract"
            name="original"
            fileName={originalName}
            inputRef={originalRef}
            onChange={(name) => setOriginalName(name)}

          />
          <FileField
            label="Amendment"
            name="amendment"
            fileName={amendmentName}
            inputRef={amendmentRef}
            onChange={(name) => setAmendmentName(name)}
          />

          <div className="border-t border-border pt-6 space-y-3">
            {mutation.isError && (
              <p className="text-xs text-[#E04038] border border-[#E04038] px-3 py-2">
                {(mutation.error as Error).message}
              </p>
            )}

            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="w-full py-3 px-4 bg-[#E04038] text-white text-xs font-medium
                         tracking-[0.15em] uppercase hover:opacity-90 disabled:opacity-40
                         disabled:cursor-not-allowed transition-opacity"
            >
              {mutation.isPending ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

function FileField({
  label,
  name,
  fileName,
  inputRef,
  onChange,
}: {
  label: string
  name: string
  fileName: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (name: string) => void
}) {
  return (
    <div className="border-t border-border py-5 space-y-3">
      <label className="block text-xs tracking-[0.15em] uppercase text-neutral-500 font-bold">
        {label}
      </label>
      <label
        htmlFor={name}
        className="flex items-center cursor-pointer border border-neutral-200 px-4 py-4
                   hover:border-[#E04038] transition-colors group"
      >
        <span className="text-xs text-neutral-400 truncate group-hover:text-neutral-600 transition-colors">
          {fileName || 'Choose file'}
        </span>
      </label>
      <input
        id={name}
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0]?.name ?? '')}
      />
    </div>
  )
}
