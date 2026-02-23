'use client'
import Link from 'next/link'

export default function MainLayout({ children }: any) {
  return (
    <div className="flex min-h-screen">
      
      <aside className="w-64 bg-slate-900 text-white p-6 space-y-4">
        <h1 className="text-lg font-bold">YARD V2</h1>

        <Link href="/dashboard">Dashboard</Link>
        <Link href="/incoming">Incoming</Link>
        <Link href="/scan">Scan</Link>
        <Link href="/heatmap">Heatmap</Link>
        <Link href="/delivery">Delivery</Link>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
