'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ScanLine,
  Map,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  Truck,
  Settings,
  PackageCheck,
  Wrench,
  Archive,
  X,
  MoreVertical,
  Users,
  UserCircle,
  LogOut,
  QrCode,
  Menu, // Icon baru untuk master 'Others'
} from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from '@/lib/axios'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  // --- STATE DESKTOP (ASLI LO - TIDAK DIUBAH) ---
  const [openIncoming, setOpenIncoming] = useState(true)
  const [openDelivery, setOpenDelivery] = useState(false)

  // --- STATE MOBILE (DITAMBAH 'others') ---
  const [activeFloating, setActiveFloating] =
    useState<'incoming' | 'delivery' | 'others' | null>(null)

  // --- USER STATE (ASLI LO - TIDAK DIUBAH) ---
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (pathname.includes('/incoming')) setOpenIncoming(true)
    if (pathname.includes('/delivery')) setOpenDelivery(true)
    setActiveFloating(null)
  }, [pathname])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const res = await axios.get('/auth/me')
        setCurrentUser(res.data)
      } catch (err) {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        router.push('/login')
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    router.push('/login')
    window.location.reload()
  }

  const isActive = (path: string) => pathname === path
  const isInclude = (path: string) => pathname.startsWith(path)

  const incomingSubMenus = [
    { label: 'Incoming Master', href: '/incoming', icon: PlusCircle },
    { label: 'Ready to PDI', href: '/incoming/ready-pdi', icon: PackageCheck },
    { label: 'Repair Unit', href: '/incoming/repair', icon: Wrench },
    { label: 'Ready Stock', href: '/incoming/ready', icon: Archive },
  ]

  const role = currentUser?.role
  const isAdmin = role === 'ADMIN'

  // --- LOGIC HELPER UNTUK CEK ACTIVE DI 'OTHERS' ---
  const isOthersActive = isActive('/users') || isActive('/print-qr')

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      {/* ==========================================
          DESKTOP SIDEBAR (TIDAK DISENTUH)
      ========================================== */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen transition-all duration-300">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Truck className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              Yard System
            </h1>
          </div>

          <nav className="flex flex-col space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Main Menu</p>
            
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive('/dashboard') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard size={20} className={isActive('/dashboard') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
              Dashboard
            </Link>

            <Link
              href="/scan"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive('/scan') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ScanLine size={20} className={isActive('/scan') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
              Scan QR Code
            </Link>

            <hr className="my-4 border-gray-50" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Inventory Management</p>

            <div className="space-y-1">
              <div className={`flex items-center justify-between rounded-xl transition-all ${isInclude('/incoming') ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <Link
                  href="/incoming"
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isInclude('/incoming') ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <PlusCircle size={20} className={isInclude('/incoming') ? 'text-blue-600' : 'text-gray-400'} />
                  Incoming Master
                </Link>
                <button onClick={() => setOpenIncoming(!openIncoming)} className="p-3 text-gray-400 hover:text-gray-600 transition-transform">
                  {openIncoming ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
              {openIncoming && (
                <div className="ml-6 pl-4 border-l-2 border-gray-100 flex flex-col space-y-1 py-1 animate-in slide-in-from-top-2 duration-200">
                  {incomingSubMenus.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                        isActive(item.href) ? 'text-blue-600 font-semibold bg-blue-50/80 shadow-sm shadow-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={14} className={isActive(item.href) ? 'text-blue-500' : 'text-gray-300'} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
               <div className={`flex items-center justify-between rounded-xl transition-all ${isInclude('/delivery') ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <Link
                  href="/delivery"
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isInclude('/delivery') ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Truck size={20} className={isInclude('/delivery') ? 'text-blue-600' : 'text-gray-400'} />
                  Delivery Master
                </Link>
                <button onClick={() => setOpenDelivery(!openDelivery)} className="p-3 text-gray-400 hover:text-gray-600">
                  {openDelivery ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
              {openDelivery && (
                <div className="ml-6 pl-4 border-l-2 border-gray-100 flex flex-col space-y-1 py-1">
                  <Link href="/delivery" className={`px-4 py-2 text-sm rounded-lg transition-all ${isActive('/delivery') ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                    All Deliveries
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/heatmap"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive('/heatmap') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Map size={20} className={isActive('/heatmap') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
              Yard Heatmap
            </Link>

            <Link
              href="/print-qr"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/print-qr') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <QrCode size={20} className={isActive('/print-qr') ? 'text-blue-600' : 'text-gray-400'} />
              Print QR
            </Link>

            {isAdmin && (
              <Link
                href="/users"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/users') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Users size={20} className={isActive('/users') ? 'text-blue-600' : 'text-gray-400'} />
                User Management
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-4">
          {currentUser && (
            <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl">
              <UserCircle size={36} className="text-blue-600" />
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold text-gray-800 truncate">{currentUser.name || currentUser.email}</div>
                <div className="text-xs text-gray-500 font-semibold uppercase">{currentUser.role}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 pb-24 md:pb-8 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* ==========================================
          MOBILE FLOATING MENU (PENAMBAHAN OTHERS)
      ========================================== */}
      {activeFloating && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in" onClick={() => setActiveFloating(null)} />
          <div className="fixed bottom-28 left-6 right-6 bg-white rounded-3xl p-5 z-[70] shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-widest">
                {activeFloating === 'incoming' ? 'Incoming Options' : activeFloating === 'delivery' ? 'Delivery Options' : 'Others'}
              </h3>
              <button onClick={() => setActiveFloating(null)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={16} /></button>
            </div>
            <div className="space-y-2">
              {/* RENDER BERDASARKAN TYPE */}
              {activeFloating === 'incoming' && incomingSubMenus.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive(item.href) ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}>
                  <item.icon size={18} />
                  <span className="font-bold text-sm">{item.label}</span>
                </Link>
              ))}

              {activeFloating === 'delivery' && (
                <Link href="/delivery" className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('/delivery') ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}>
                  <Truck size={18} />
                  <span className="font-bold text-sm">All Deliveries</span>
                </Link>
              )}

              {activeFloating === 'others' && (
                <div className="space-y-2">
                   {isAdmin && (
                    <Link href="/users" className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('/users') ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}>
                      <Users size={18} />
                      <span className="font-bold text-sm">User Management</span>
                    </Link>
                   )}
                   <Link href="/print-qr" className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('/print-qr') ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}>
                      <QrCode size={18} />
                      <span className="font-bold text-sm">Print QR</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-600 transition-all active:bg-red-600 active:text-white">
                      <LogOut size={18} />
                      <span className="font-bold text-sm">Logout</span>
                    </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION (DIPERBAHARUI)
      ========================================== */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl flex justify-around items-center py-4 px-2 z-50">
        
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-400'}`}>
          <LayoutDashboard size={22} />
          <span className={`text-[9px] font-bold uppercase ${isActive('/dashboard') ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Home</span>
        </Link>
        
        <Link href="/scan" className={`flex flex-col items-center gap-1 ${isActive('/scan') ? 'text-blue-600' : 'text-gray-400'}`}>
          <ScanLine size={22} />
          <span className={`text-[9px] font-bold uppercase ${isActive('/scan') ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Scan</span>
        </Link>

        {/* INCOMING */}
        <button onClick={() => setActiveFloating('incoming')} className={`flex flex-col items-center gap-1 ${isInclude('/incoming') ? 'text-blue-600' : 'text-gray-400'}`}>
          <PlusCircle size={22} />
          <span className={`text-[9px] font-bold uppercase ${isInclude('/incoming') ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>In</span>
        </button>

        {/* DELIVERY */}
        <button onClick={() => setActiveFloating('delivery')} className={`flex flex-col items-center gap-1 ${isInclude('/delivery') ? 'text-blue-600' : 'text-gray-400'}`}>
          <Truck size={22} />
          <span className={`text-[9px] font-bold uppercase ${isInclude('/delivery') ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Out</span>
        </button>

        <Link href="/heatmap" className={`flex flex-col items-center gap-1 ${isActive('/heatmap') ? 'text-blue-600' : 'text-gray-400'}`}>
          <Map size={22} />
          <span className={`text-[9px] font-bold uppercase ${isActive('/heatmap') ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Map</span>
        </Link>

        {/* OTHERS MASTER (NEW GROUP) */}
        <button 
          onClick={() => setActiveFloating('others')} 
          className={`flex flex-col items-center gap-1 ${isOthersActive ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Menu size={22} />
          <span className={`text-[9px] font-bold uppercase ${isOthersActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Others</span>
        </button>

      </nav>
    </div>
  )
}