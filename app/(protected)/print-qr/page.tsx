'use client'

import { useEffect, useState, useMemo } from 'react'
import axios from '@/lib/axios'
import { 
  Printer, 
  Search, 
  FileSearch, 
  CheckSquare, 
  Square, 
  Download,
  Loader2,
  FilterX
} from 'lucide-react'

export default function PrintQRPage() {
  const [goods, setGoods] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState(false)

  // State untuk Filter
  const [filters, setFilters] = useState({
    engine: '',
    chassis: '',
    bl: '',
    status: ''
  })

  useEffect(() => {
    fetchGoods()
  }, [])

  const fetchGoods = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/goods')
      setGoods(res.data)
    } finally {
      setLoading(false)
    }
  }

  // Logic Filter per Field (Client Side)
  const filteredGoods = useMemo(() => {
    return goods.filter(g => {
      return (
        g.unit.engineNumber.toLowerCase().includes(filters.engine.toLowerCase()) &&
        g.unit.chassisNumber.toLowerCase().includes(filters.chassis.toLowerCase()) &&
        g.unit.blNumber.toLowerCase().includes(filters.bl.toLowerCase()) &&
        g.currentStatus.toLowerCase().includes(filters.status.toLowerCase())
      )
    })
  }, [goods, filters])

  const toggleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === filteredGoods.length) {
      setSelected([])
    } else {
      setSelected(filteredGoods.map(g => g.id))
    }
  }

  const handlePrint = async () => {
    if (selected.length === 0) return alert('Pilih minimal 1 unit untuk dicetak')

    try {
      setPrinting(true)
      const res = await axios.get(
        `/goods/print-qr?ids=${selected.join(',')}`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `QR-BATCH-${new Date().getTime()}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      alert('Gagal mengunduh QR Code')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Printer className="text-blue-600" size={32} />
            Print QR Batch
          </h1>
          <p className="text-slate-500 font-medium">Select units to generate high-quality QR labels</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm">
           <div className="px-4 py-2 border-r">
             <span className="text-xs font-bold text-slate-400 uppercase block">Selected</span>
             <span className="text-lg font-black text-blue-600">{selected.length} <span className="text-slate-400 text-sm">Units</span></span>
           </div>
           <button
            onClick={handlePrint}
            disabled={selected.length === 0 || printing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
          >
            {printing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {printing ? 'Generating...' : 'Download QR Batch'}
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-600" size={18} />
          <input 
            placeholder="Filter Engine..."
            className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 rounded-xl py-2.5 pl-10 text-sm outline-none transition-all"
            value={filters.engine}
            onChange={(e) => setFilters({...filters, engine: e.target.value})}
          />
        </div>
        <div className="relative group">
          <FileSearch className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-600" size={18} />
          <input 
            placeholder="Filter Chassis..."
            className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 rounded-xl py-2.5 pl-10 text-sm outline-none transition-all"
            value={filters.chassis}
            onChange={(e) => setFilters({...filters, chassis: e.target.value})}
          />
        </div>
        <div className="relative group">
          <FileSearch className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-600" size={18} />
          <input 
            placeholder="Filter BL Number..."
            className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 rounded-xl py-2.5 pl-10 text-sm outline-none transition-all"
            value={filters.bl}
            onChange={(e) => setFilters({...filters, bl: e.target.value})}
          />
        </div>
        <button 
          onClick={() => setFilters({ engine: '', chassis: '', bl: '', status: '' })}
          className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors"
        >
          <FilterX size={18} /> Clear Filters
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 w-14">
                  <button 
                    onClick={toggleSelectAll}
                    className="text-blue-600 hover:scale-110 transition-transform"
                  >
                    {selected.length === filteredGoods.length && filteredGoods.length > 0 ? (
                      <CheckSquare size={24} fill="currentColor" className="text-blue-600 fill-blue-50" />
                    ) : (
                      <Square size={24} className="text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Engine Number</th>
                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Chassis Number</th>
                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">BL Number</th>
                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Fetching units data...</p>
                  </td>
                </tr>
              ) : filteredGoods.length > 0 ? (
                filteredGoods.map(g => (
                  <tr 
                    key={g.id} 
                    onClick={() => toggleSelect(g.id)}
                    className={`group cursor-pointer transition-colors ${selected.includes(g.id) ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-5">
                      <div className={`transition-all ${selected.includes(g.id) ? 'scale-110' : ''}`}>
                        {selected.includes(g.id) ? (
                          <CheckSquare size={22} className="text-blue-600" />
                        ) : (
                          <Square size={22} className="text-slate-200 group-hover:text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="font-black text-slate-700 block tracking-tight">{g.unit.engineNumber}</span>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">{g.unit.chassisNumber}</td>
                    <td className="p-5 text-slate-600 font-medium">{g.unit.blNumber}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        g.currentStatus === 'READY' ? 'bg-green-50 text-green-600 border-green-100' : 
                        g.currentStatus === 'INCOMING' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {g.currentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">No units match your filters</p>
                    <button 
                      onClick={() => setFilters({ engine: '', chassis: '', bl: '', status: '' })}
                      className="text-blue-600 text-sm font-bold mt-2 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}