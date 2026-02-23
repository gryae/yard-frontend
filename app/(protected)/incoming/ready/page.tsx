'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  Truck, 
  Search, 
  ChevronRight, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Car, 
  X, 
  ArrowRight,
  Hash
} from 'lucide-react'

interface Goods {
  id: string
  currentStatus: string
  createdAt: string
  unit?: {
    brand?: string
    engineNumber?: string
    chassisNumber?: string
  }
}

export default function ReadyPage() {
  const router = useRouter()
  const [data, setData] = useState<Goods[]>([])
  const [selected, setSelected] = useState<Goods | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/goods?status=READY')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const proceedDelivery = (id: string) => {
    router.push(`/delivery/create?goodsId=${id}`)
  }

  const filteredData = data.filter(item => 
    item.unit?.engineNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit?.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-green-600 p-3 rounded-2xl text-white shadow-lg shadow-green-200">
            <Truck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ready to Delivery</h1>
            <p className="text-gray-500 font-medium">Unit siap kirim ke customer</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Cari unit atau mesin..."
            className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Brand</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Identification</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Aging Status</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((g) => {
                const aging = Math.floor(
                  (new Date().getTime() - new Date(g.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                )
                const isLate = aging > 30

                return (
                  <tr 
                    key={g.id} 
                    onClick={() => setSelected(g)}
                    className="hover:bg-green-50/50 cursor-pointer group transition-all"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-green-600 border border-gray-100 group-hover:bg-white transition-colors">
                          <Car size={20} />
                        </div>
                        <span className="font-bold text-gray-800">{g.unit?.brand || '-'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-mono font-bold text-gray-700 underline decoration-gray-200 underline-offset-4">
                          <Hash size={14} className="text-gray-400" />
                          {g.unit?.engineNumber}
                        </div>
                        <div className="text-[10px] text-gray-400">CH: {g.unit?.chassisNumber}</div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        isLate ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                      }`}>
                        {isLate ? <AlertCircle size={14} /> : <Clock size={14} />}
                        {aging} Hari
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-3 opacity-30">
            <Truck size={48} />
            <p className="font-bold uppercase tracking-widest text-sm">No Units Ready</p>
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setSelected(null)} 
          />
          <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="bg-green-600 p-8 text-white relative">
              <button 
                onClick={() => setSelected(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Truck size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Shipment Ready</span>
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">Delivery Order</h2>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <InfoBox label="Brand" value={selected.unit?.brand} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoBox label="Engine" value={selected.unit?.engineNumber} mono />
                  <InfoBox label="Status" value={selected.currentStatus} />
                </div>
                <InfoBox label="Chassis Number" value={selected.unit?.chassisNumber} mono />
              </div>

              <button
                onClick={() => proceedDelivery(selected.id)}
                className="w-full bg-gray-900 hover:bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                CREATE DELIVERY
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoBox({ label, value, mono = false }: { label: string, value?: string, mono?: boolean }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-gray-800 font-bold leading-tight ${mono ? 'font-mono text-xs' : 'text-sm'}`}>
        {value || '-'}
      </p>
    </div>
  )
}