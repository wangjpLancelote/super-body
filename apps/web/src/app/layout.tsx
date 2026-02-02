import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../app/globals.css'
import { AuthProvider } from '@/auth/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LifeByte Super Body',
  description: 'AI-powered health and fitness tracking application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}