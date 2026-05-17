export default function DocsPage() {
  return (
    <main className="flex-1 px-[var(--grid-margin)] py-16 max-w-5xl">
      <div className="border-b border-foreground pb-4 mb-12">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Documentation</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">API Reference</h1>
        <p className="mt-2 text-sm text-muted-foreground">ClauseMatch AI REST API — v1</p>
      </div>

      <div className="space-y-16">
        <section>
          <div className="border-t border-border py-6">
            <p className="font-mono text-sm font-medium text-foreground mb-1">POST /api/v1/analyze</p>
            <p className="text-sm text-muted-foreground">
              Analyzes two contract documents and returns a structured diff report.
            </p>
          </div>

          <div className="grid grid-cols-[3fr_9fr] gap-[var(--grid-gutter)] border-t border-border py-6">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium pt-0.5">
              Request
            </p>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground mb-4">
                multipart/form-data
              </p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-6 text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">Field</th>
                    <th className="pb-2 pr-6 text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">Type</th>
                    <th className="pb-2 text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-6 font-mono text-xs text-primary">original_file</td>
                    <td className="py-3 pr-6 text-xs text-muted-foreground">File</td>
                    <td className="py-3 text-xs text-foreground">The original contract (PDF, DOCX, or TXT)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-mono text-xs text-primary">amendment_file</td>
                    <td className="py-3 pr-6 text-xs text-muted-foreground">File</td>
                    <td className="py-3 text-xs text-foreground">The amendment document (PDF, DOCX, or TXT)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-mono text-xs text-primary">model_tier</td>
                    <td className="py-3 pr-6 text-xs text-muted-foreground">string?</td>
                    <td className="py-3 text-xs text-foreground">&quot;standard&quot; (default) or &quot;premium&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-[3fr_9fr] gap-[var(--grid-gutter)] border-t border-border py-6">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium pt-0.5">
              Response
            </p>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground mb-4">200 OK</p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-6 text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">Field</th>
                    <th className="pb-2 pr-6 text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">Type</th>
                    <th className="pb-2 text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-6 font-mono text-xs text-primary">sections_changed</td>
                    <td className="py-3 pr-6 text-xs text-muted-foreground">string[]</td>
                    <td className="py-3 text-xs text-foreground">Clause identifiers that were modified</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-mono text-xs text-primary">topics_touched</td>
                    <td className="py-3 pr-6 text-xs text-muted-foreground">string[]</td>
                    <td className="py-3 text-xs text-foreground">Legal categories affected (Pricing, Duration…)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-mono text-xs text-primary">summary_of_the_change</td>
                    <td className="py-3 pr-6 text-xs text-muted-foreground">string</td>
                    <td className="py-3 text-xs text-foreground">Professional narrative of what changed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-[3fr_9fr] gap-[var(--grid-gutter)] border-t border-border py-6">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium pt-0.5">
              Example
            </p>
            <pre className="bg-foreground text-background p-4 text-xs overflow-x-auto font-mono leading-relaxed">
{`curl -F "original_file=@contract.pdf" \\
     -F "amendment_file=@amendment.pdf" \\
     http://localhost:8000/api/v1/analyze`}
            </pre>
          </div>
        </section>

        <section>
          <div className="border-t border-border py-6">
            <p className="font-mono text-sm font-medium text-foreground mb-1">GET /api/v1/health</p>
            <p className="text-sm text-muted-foreground">
              Returns{' '}
              <span className="font-mono bg-muted px-1 text-foreground">{'{"status": "ok"}'}</span>
              {' '}when the server is running.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
