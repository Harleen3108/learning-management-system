import './globals.css'
import { Inter } from 'next/font/google'
import ProgressBar from '@/components/ProgressBar'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LMS - Learning Management System',
  description: 'A comprehensive full-stack LMS platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>
            <ProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
