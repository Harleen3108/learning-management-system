import './globals.css'
import { Inter, DM_Sans } from 'next/font/google'
import ProgressBar from '@/components/ProgressBar'
import { Suspense } from 'react'
import logo from '@/assets/favicon_circle.png'
import GoogleAuthProviderWrapper from '@/components/GoogleAuthProvider'
import AuthInitializer from '@/components/AuthInitializer'

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
  title: 'EduFlow-Learning Management System',
  description: 'A comprehensive full-stack LMS platform',
  icons: {
    icon: logo.src,
  },
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} font-sans`}>
        <GoogleAuthProviderWrapper>
          <Suspense fallback={null}>
              <ProgressBar />
              <AuthInitializer />
          </Suspense>
          {children}
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  )
}
