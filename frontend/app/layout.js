import './globals.css'
import { Inter, DM_Sans } from 'next/font/google'
import ProgressBar from '@/components/ProgressBar'
import { Suspense } from 'react'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata = {
  title: 'LMS - Learning Management System',
  description: 'A comprehensive full-stack LMS platform',
}

import GoogleAuthProviderWrapper from '@/components/GoogleAuthProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} font-sans`}>
        <GoogleAuthProviderWrapper>
          <Suspense fallback={null}>
              <ProgressBar />
          </Suspense>
          {children}
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  )
}
