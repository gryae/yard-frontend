'use client'

import { useState } from 'react'
import axios from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { Truck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Menghindari reload page
    setLoading(true)
    setError('')

    try {
      const res = await axios.post('/auth/login', {
        email,
        password,
      })

      localStorage.setItem('token', res.data.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
      {/* Dekorasi Background */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
      
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-200 mb-4 animate-in zoom-in duration-500">
            <Truck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Yard<span className="text-blue-600">V2</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Logistics & Inventory Management</p>
        </div>

        {/* Card Login */}
        <div className="bg-white p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {error && (
              <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-2xl border border-red-100 animate-in shake duration-300">
                <AlertCircle size={16} />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 p-3.5 pl-12 rounded-2xl transition-all outline-none text-slate-900"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 p-3.5 pl-12 rounded-2xl transition-all outline-none text-slate-900"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold p-4 rounded-2xl shadow-lg shadow-slate-200 transition-all duration-300 flex items-center justify-center gap-2 group disabled:bg-slate-400"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Yard System Enterprise
        </p>
      </div>
    </div>
  )
}