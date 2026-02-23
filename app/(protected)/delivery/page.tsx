'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  Truck, 
  Plus, 
  Search, 
  Hash,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X
} from 'lucide-react'

// Interface tetap sama
interface Goods {
  id: string
  currentStatus: string
  deliveredAt?: string
  unit?: {
    brand?: string
    engineNumber?: string
    chassisNumber?: string
  }
  deliveryItems?: {
    delivery?: {
      id: string
      suratJalanNumber: string
      deliveredAt?: string
      completedAt?: string
    }
  }[]
  deliveryToken?: string | null
  isLocked?: boolean
  attemptCount?: number
}

export default function DeliveryMasterPage() {
  const router = useRouter()
  const [data, setData] = useState<Goods[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // STATE BARU: Untuk Sorting & Filter per Field
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'brand',
    direction: null
  })
  const [fieldFilters, setFieldFilters] = useState({
    brand: '',
    engine: '',
    status: '',
    aging: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get('/goods?deliveryStatus=true')
      setData(res.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  // LOGIC AGING (Tetap sama sesuai punya lo)
  const getAging = (delivery: any) => {
    if (!delivery?.deliveredAt) return 202
    const start = new Date(delivery.deliveredAt).getTime()
    if (delivery.completedAt) {
      return Math.floor((new Date(delivery.completedAt).getTime() - start) / (1000 * 60 * 60 * 24))
    }
    return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24))
  }

  // LOGIC FILTER & SORTING (DIBUNGKUS USEMEMO)
  const processedData = useMemo(() => {
    let filtered = data.filter(g => {
      const delivery = g.deliveryItems?.[0]?.delivery
      const aging = getAging(delivery)
      
      const matchGlobal = ['DELIVERED', 'RECEIVED', 'COMPLETED'].includes(g.currentStatus) &&
        (g.unit?.engineNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         g.unit?.brand?.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchBrand = g.unit?.brand?.toLowerCase().includes(fieldFilters.brand.toLowerCase())
      const matchEngine = g.unit?.engineNumber?.toLowerCase().includes(fieldFilters.engine.toLowerCase())
      const matchStatus = g.currentStatus.toLowerCase().includes(fieldFilters.status.toLowerCase())
      const matchAging = fieldFilters.aging === '' || aging.toString().includes(fieldFilters.aging)

      return matchGlobal && matchBrand && matchEngine && matchStatus && matchAging
    })

    if (sortConfig.direction !== null) {
      filtered.sort((a, b) => {
        let valA: any, valB: any

        if (sortConfig.key === 'brand') {
          valA = a.unit?.brand || ''
          valB = b.unit?.brand || ''
        } else if (sortConfig.key === 'status') {
          valA = a.currentStatus
          valB = b.currentStatus
        } else if (sortConfig.key === 'aging') {
          valA = getAging(a.deliveryItems?.[0]?.delivery)
          valB = getAging(b.deliveryItems?.[0]?.delivery)
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, fieldFilters, sortConfig])

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleGoToDetail = async (goods: Goods) => {
    const res = await axios.get(`/delivery/by-goods/${goods.id}`)
    if (res.data?.exists && res.data?.deliveryId) {
      router.push(`/delivery/${res.data.deliveryId}`)
    } else {
      alert("Delivery not found")
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2 md:p-6">
      
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <Truck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Delivery Master</h1>
            <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Monitoring & Logistics Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={18} />
            <input 
              type="text"
              placeholder="Quick search..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-full md:w-64 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => router.push('/delivery/create')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span className="hidden md:block">Create Delivery</span>
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* HEADER ROW 1: Sorting Headers */}
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th 
                  className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => requestSort('brand')}
                >
                  <div className="flex items-center gap-2">
                    Unit Info 
                    {sortConfig.key === 'brand' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30"/>}
                  </div>
                </th>
                <th 
                  className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Status
                    {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30"/>}
                  </div>
                </th>
                <th 
                  className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => requestSort('aging')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Aging
                    {sortConfig.key === 'aging' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30"/>}
                  </div>
                </th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>

              {/* HEADER ROW 2: Field Filters */}
              <tr className="bg-white border-b border-gray-50">
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <input 
                      placeholder="Filter Brand..."
                      className="text-[11px] w-1/2 p-1.5 border-none bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={fieldFilters.brand}
                      onChange={(e) => setFieldFilters({...fieldFilters, brand: e.target.value})}
                    />
                    <input 
                      placeholder="Filter Engine..."
                      className="text-[11px] w-1/2 p-1.5 border-none bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={fieldFilters.engine}
                      onChange={(e) => setFieldFilters({...fieldFilters, engine: e.target.value})}
                    />
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select 
                    className="text-[11px] w-full p-1.5 border-none bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={fieldFilters.status}
                    onChange={(e) => setFieldFilters({...fieldFilters, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="RECEIVED">RECEIVED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-center">
                  <input 
                    placeholder="Days..."
                    type="number"
                    className="text-[11px] w-20 p-1.5 border-none bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 mx-auto"
                    value={fieldFilters.aging}
                    onChange={(e) => setFieldFilters({...fieldFilters, aging: e.target.value})}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <button 
                    onClick={() => setFieldFilters({ brand: '', engine: '', status: '', aging: '' })}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50">
              {processedData.map(g => {
                const delivery = g.deliveryItems?.[0]?.delivery
                const aging = getAging(delivery)
                const isLate = aging > 14

                return (
                  <tr 
                    key={g.id} 
                    onClick={() => handleGoToDetail(g)}
                    className="hover:bg-indigo-50/30 cursor-pointer group transition-all"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
                          {g.unit?.brand?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-none mb-1">{g.unit?.brand}</div>
                          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                            <Hash size={12} /> {g.unit?.engineNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        g.currentStatus === 'DELIVERED' ? 'bg-orange-100 text-orange-600' :
                        g.currentStatus === 'RECEIVED' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {g.currentStatus}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className={`text-sm font-bold ${isLate ? 'text-red-600' : 'text-gray-600'}`}>
                        {aging} <span className="text-[10px] font-normal opacity-60">Days</span>
                      </div>
                    </td>
                    <td className="p-5 text-right text-gray-300 group-hover:text-indigo-600 transition-colors">
                      <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest">
                        View Detail <ChevronRight size={18} />
                      </div>
                    </td>
                  </tr>
                )}
              )}
            </tbody>
          </table>
          {processedData.length === 0 && (
            <div className="p-20 text-center text-gray-400 font-medium">
              No matching delivery data found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}