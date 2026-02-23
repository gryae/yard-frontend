import './globals.css'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title:{
    default: 'YPv2',
    template: '%s | YPv2'
  },
  description: 'Yard Monitoring & Inventory',
  icons:{
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  )
}

