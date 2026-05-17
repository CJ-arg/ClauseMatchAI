import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DocsPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Reference</h1>
        <p className="mt-1 text-gray-500">ClauseMatch AI REST API — v1</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-mono">POST /api/v1/analyze</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-gray-600">Analyzes two contract documents and returns a structured diff report.</p>

          <div>
            <p className="font-medium text-gray-700 mb-2">Request — multipart/form-data</p>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-1 pr-4 text-gray-500 font-medium">Field</th>
                  <th className="py-1 pr-4 text-gray-500 font-medium">Type</th>
                  <th className="py-1 text-gray-500 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-2 pr-4 font-mono text-indigo-600">original_file</td>
                  <td className="py-2 pr-4 text-gray-500">File</td>
                  <td className="py-2 text-gray-600">The original contract (PDF, DOCX, or TXT)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-indigo-600">amendment_file</td>
                  <td className="py-2 pr-4 text-gray-500">File</td>
                  <td className="py-2 text-gray-600">The amendment document (PDF, DOCX, or TXT)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-indigo-600">model_tier</td>
                  <td className="py-2 pr-4 text-gray-500">string?</td>
                  <td className="py-2 text-gray-600">&quot;standard&quot; (default) or &quot;premium&quot;</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-2">Response — 200 OK</p>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-1 pr-4 text-gray-500 font-medium">Field</th>
                  <th className="py-1 pr-4 text-gray-500 font-medium">Type</th>
                  <th className="py-1 text-gray-500 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-2 pr-4 font-mono text-indigo-600">sections_changed</td>
                  <td className="py-2 pr-4 text-gray-500">string[]</td>
                  <td className="py-2 text-gray-600">Clause identifiers that were modified</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-indigo-600">topics_touched</td>
                  <td className="py-2 pr-4 text-gray-500">string[]</td>
                  <td className="py-2 text-gray-600">Legal categories affected (Pricing, Duration…)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-indigo-600">summary_of_the_change</td>
                  <td className="py-2 pr-4 text-gray-500">string</td>
                  <td className="py-2 text-gray-600">Professional narrative of what changed</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-2">Example</p>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">
{`curl -F "original_file=@contract.pdf" \\
     -F "amendment_file=@amendment.pdf" \\
     http://localhost:8000/api/v1/analyze`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base font-mono">GET /api/v1/health</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-600">
          Returns <span className="font-mono bg-gray-100 px-1 rounded">{'{"status": "ok"}'}</span> when the server is running.
        </CardContent>
      </Card>
    </main>
  )
}
