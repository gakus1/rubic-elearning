import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rubic E-læring',
  description: 'E-læring prototype for Rubic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  )
}
