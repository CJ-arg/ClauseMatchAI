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
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">ClauseMatch AI</h1>
          <p className="mt-2 text-gray-500">Upload two contract documents to detect every change.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
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

          {mutation.isError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
              {(mutation.error as Error).message}
            </p>
          )}

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold
                       hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {mutation.isPending ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400">
          Supports PDF, DOCX, and TXT — standard and premium models available
        </p>
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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <label
        htmlFor={name}
        className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200
                   rounded-xl px-4 py-5 hover:border-indigo-400 transition-colors"
      >
        <span className="text-2xl">📄</span>
        <span className="text-sm text-gray-500 truncate">
          {fileName || 'Click to choose a file'}
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
