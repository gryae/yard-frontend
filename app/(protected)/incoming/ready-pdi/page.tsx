'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  ClipboardCheck, 
  Search, 
  ChevronRight, 
  Calendar, 
  Hash, 
  Car,
  X,
  ArrowRightCircle,
  Clock
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

export default function ReadyToPDIPage() {
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
      const res = await axios.get('/goods?status=INCOMING')
      setData(res.data)
    } catch (err) {
      console.error("Failed to fetch PDI data", err)
    } finally {
      setLoading(false)
    }
  }

  const proceedPDI = (id: string) => {
    router.push(`/pdi/${id}`)
  }

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
              <ClipboardCheck size={24} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Ready to PDI
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-medium ml-1">
            Daftar unit masuk yang menunggu antrean inspeksi PDI.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Cari No. Mesin atau Brand..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-full md:w-72 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Brand / Unit</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Identitas Mesin</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tgl Masuk</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length > 0 ? (
                filteredData.map((g) => (
                  <tr 
                    key={g.id} 
                    onClick={() => setSelected(g)}
                    className="hover:bg-blue-50/50 cursor-pointer group transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors border border-gray-100">
                          <Car size={20} />
                        </div>
                        <span className="font-bold text-gray-900">{g.unit?.brand || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-mono font-semibold text-gray-700">
                          <Hash size={14} className="text-gray-400" />
                          {g.unit?.engineNumber}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[150px]">
                          Chassis: {g.unit?.chassisNumber}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Clock size={14} className="text-blue-400" />
                        {new Date(g.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Detail <ChevronRight size={14} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardCheck size={48} className="text-gray-200" />
                      <p className="text-gray-400 font-medium">Antrean PDI kosong</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setSelected(null)} 
          />
          
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="bg-blue-600 p-6 text-white relative">
              <button 
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black">Unit Detail</h2>
              <p className="text-blue-100 text-sm">Review data sebelum inspeksi PDI</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <DetailRow label="Brand" value={selected.unit?.brand} />
                <DetailRow label="Engine No" value={selected.unit?.engineNumber} isMono />
                <DetailRow label="Chassis No" value={selected.unit?.chassisNumber} isMono />
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    {selected.currentStatus}
                  </span>
                </div>
              </div>

              <button
                onClick={() => proceedPDI(selected.id)}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Mulai Inspeksi PDI
                <ArrowRightCircle size={20} />
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

function DetailRow({ label, value, isMono = false }: { label: string, value?: string, isMono?: boolean }) {
  return (
    <div className="border-b border-gray-50 pb-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-gray-900 font-bold ${isMono ? 'font-mono text-sm' : 'text-base'}`}>
        {value || '-'}
      </p>
    </div>
  )
}