import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'ClauseMatch AI',
  description: 'Autonomous contract amendment analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background flex flex-col">
        <Providers>
          <nav className="border-b border-border bg-background px-[var(--grid-margin)] py-4 flex items-center justify-between">
            <a href="/" className="text-xs font-bold tracking-[0.2em] uppercase text-foreground hover:text-[#E04038] transition-colors">
              ClauseMatch AI
            </a>
            <a href="/docs" className="text-xs tracking-[0.15em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors">
              API Docs
            </a>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  )
}
