import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moe.local | Local Marketing for Northville, Michigan Businesses',
  description: 'Helping local Northville businesses get more customers through short-form content, targeted Facebook/Instagram ads, and follow-up systems that turn leads into bookings.',
  keywords: 'Northville marketing, local business marketing, Michigan marketing agency, social media marketing, Facebook ads, Instagram marketing',
  openGraph: {
    title: 'Moe.local | Local Marketing for Northville, Michigan Businesses',
    description: 'Helping local Northville businesses get more customers through short-form content, targeted ads, and follow-up systems.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
