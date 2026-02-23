'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  Wrench, 
  Search, 
  ChevronRight, 
  Calendar, 
  Hash, 
  Info,
  X,
  AlertCircle
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

export default function RepairPage() {
  const router = useRouter()

  const [data, setData] = useState<Goods[]>([])
  const [selected, setSelected] = useState<Goods | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get('/goods?status=REPAIR')
      setData(res.data)
    } catch (err) {
      console.error("Failed to fetch repair data", err)
    }
  }

  const proceedRepair = (id: string) => {
    router.push(`/repair/${id}`)
  }

  // Filter logic (optional enhancement for UI)
  const filteredData = data.filter(item => 
    item.unit?.engineNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit?.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
  if (!confirm('Delete this unit permanently?')) return;

  try {
    await axios.delete(`/goods/${selected?.id}`);
    alert('Unit deleted');
    router.push('/dashboard');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error');
  }
};

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <Wrench size={20} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Repair Units</h1>
          </div>
          <p className="text-sm text-gray-500 ml-10">Daftar unit yang memerlukan tindakan perbaikan.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search engine or brand..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-full md:w-72 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE / LIST SECTION */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Unit Info</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Numbers</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Entry Date</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length > 0 ? (
                filteredData.map((g) => (
                  <tr 
                    key={g.id} 
                    onClick={() => setSelected(g)}
                    className="hover:bg-orange-50/30 cursor-pointer group transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                          <Wrench size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{g.unit?.brand || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 md:hidden">{g.unit?.engineNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Hash size={12} className="text-gray-400" />
                          <span className="font-mono">{g.unit?.engineNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Info size={12} />
                          <span>{g.unit?.chassisNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(g.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle size={48} className="text-gray-200" />
                      <p className="text-gray-400 font-medium">No units found in repair queue</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL - Glassmorphism style */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setSelected(null)} 
          />
          
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="bg-orange-600 p-6 text-white relative">
              <button 
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <Wrench size={40} className="mb-4 opacity-50" />
              <h2 className="text-2xl font-black">Repair Detail</h2>
              <p className="text-orange-100 text-sm">Review unit before proceeding</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <DetailItem label="Brand" value={selected.unit?.brand} />
                <DetailItem label="Engine Number" value={selected.unit?.engineNumber} isMono />
                <DetailItem label="Chassis Number" value={selected.unit?.chassisNumber} isMono />
                <DetailItem 
                  label="Current Status" 
                  value={selected.currentStatus} 
                  badge 
                />
              </div>

              <button
                onClick={() => proceedRepair(selected.id)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Proceed ke Form Repair
                <ChevronRight size={20} />
              </button>
                            <button
  onClick={handleDelete}
  className="bg-red-600 text-white px-4 py-2 rounded"
>
  Delete Unit
  
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sub-component for Modal Cleanliness
function DetailItem({ label, value, isMono = false, badge = false }: { label: string, value?: string, isMono?: boolean, badge?: boolean }) {
  return (
    <div className="border-b border-gray-50 pb-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      {badge ? (
        <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 uppercase">
          {value}
        </span>
      ) : (
        <p className={`text-gray-900 font-semibold ${isMono ? 'font-mono text-sm' : 'text-base'}`}>
          {value || '-'}
        </p>
      )}
    </div>
  )
}