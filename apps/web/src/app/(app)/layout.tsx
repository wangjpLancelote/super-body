import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../globals.css'
import { RequireAuth } from '@/auth/components/RequireAuth'
import { Layout } from '@/components/Layout/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LifeByte Super Body | Dashboard',
  description: 'Your personal health and fitness dashboard',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <html lang="en">
        <body className={inter.className}>
          <Layout>
            {children}
          </Layout>
        </body>
      </html>
    </RequireAuth>
  )
}