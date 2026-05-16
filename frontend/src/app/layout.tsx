import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ClauseMatch AI',
  description: 'Autonomous contract amendment analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 flex flex-col">
        <Providers>
          <nav className="border-b border-gray-200 bg-white px-6 py-3 flex gap-6 text-sm">
            <a href="/" className="font-semibold text-indigo-600">ClauseMatch AI</a>
            <a href="/docs" className="text-gray-500 hover:text-gray-900">API Docs</a>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  )
}
