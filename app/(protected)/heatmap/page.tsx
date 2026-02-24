'use client'

import { useEffect, useState, useRef } from 'react'
import axios from '@/lib/axios'
import * as XLSX from 'xlsx'
import { 
  Search, 
  FileDown, 
  X, 
  Map as MapIcon, 
  CheckCircle2,
  Clock,
  LayoutGrid,
  TrendingUp,
  AlertCircle,
  Navigation,
  FileText
} from 'lucide-react'

// --- INTERFACES ---
interface Goods {
  id: string
  status: string
  fifoRank: number | null
  aging: number
  brand: string
  engineNumber: string
  chassisNumber: string
  blNumber: string // Tambahan BL Number
}

interface Slot {
  zone: string
  row: number
  lane: number
  isActive: boolean
  goods: Goods | null
}

export default function BirdEyeHeatmap() {
  const [data, setData] = useState<Slot[]>([])
  const [selected, setSelected] = useState<Goods | null>(null)
  const [search, setSearch] = useState('')
  const [agingFilter, setAgingFilter] = useState<number>(0)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // --- LOGIC: AUTO SCROLL SAAT SEARCH ---
  useEffect(() => {
    if (search.length > 3) {
      const matchedSlot = data.find(s => 
        s.goods?.engineNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.goods?.chassisNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.goods?.blNumber?.toLowerCase().includes(search.toLowerCase()) // Search by BL
      )
      if (matchedSlot) {
        const el = document.getElementById(`slot-${matchedSlot.zone}-${matchedSlot.row}-${matchedSlot.lane}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }
  }, [search, data])

  const fetchData = async () => {
    try {
      const res = await axios.get('/goods/heatmap')
      setData(res.data)
    } catch (err) {
      console.error("Error fetching heatmap:", err)
    }
  }

  // --- LOGIC: COLORING (MERAH KE HITAM) ---
  // Merah (Oldest/Rank 1) -> Hitam (Newest)
  const getHeatmapColor = (ratio: number) => {
    // ratio 0 = Oldest (Red), ratio 1 = Newest (Black)
    const r = Math.floor(239 * (1 - ratio))
    const g = Math.floor(68 * (1 - ratio))
    const b = Math.floor(68 * (1 - ratio))
    return `rgb(${r},${g},${b})`
  }

  const getColor = (slot: Slot) => {
    if (!slot.isActive) return '#F8FAFC' 
    if (!slot.goods) return '#E2E8F0' 
    if (agingFilter > 0 && slot.goods.aging <= agingFilter) return '#CBD5E1'
    if (statusFilter !== 'ALL' && slot.goods.status !== statusFilter) return '#CBD5E1'

    const ranks = data.filter(d => d.goods?.fifoRank).map(d => d.goods!.fifoRank!)
    const maxRank = Math.max(...ranks, 1)
    const minRank = Math.min(...ranks, 1)
    
    // Normalisasi: Rank 1 (Oldest) jadi ratio 0, Rank Max (Newest) jadi ratio 1
    const ratio = (slot.goods.fifoRank! - minRank) / (maxRank - minRank || 1)
    return getHeatmapColor(ratio)
  }

  const isMatched = (slot: Slot) => {
    if (!slot.goods) return false
    
    // Logic Animasi Tuing-Tuing untuk Filter Status
    if (statusFilter !== 'ALL' && slot.goods.status === statusFilter && !search) return true

    // Logic Animasi untuk Search
    if (!search) return false
    const keyword = search.toLowerCase()
    return (
      slot.goods.engineNumber.toLowerCase().includes(keyword) ||
      slot.goods.chassisNumber.toLowerCase().includes(keyword) ||
      slot.goods.blNumber?.toLowerCase().includes(keyword) ||
      slot.goods.brand?.toLowerCase().includes(keyword)
    )
  }

  const exportPickingList = () => {
    const input = prompt('Berapa unit mau dikeluarkan (berdasarkan FIFO)?')
    if (!input) return
    const qty = Number(input)
    if (isNaN(qty) || qty <= 0) return alert('Jumlah tidak valid')
    
    const readyGoods = data.filter(d => d.goods)
    const sorted = readyGoods.sort((a, b) => (a.goods!.fifoRank || 9999) - (b.goods!.fifoRank || 9999))
    const selectedUnits = sorted.slice(0, qty)
    const rows = selectedUnits.map((d, index) => ({
      No: index + 1,
      Location: `${d.zone}-${d.row}-${d.lane}`,
      Brand: d.goods!.brand,
      Engine: d.goods!.engineNumber,
      Chassis: d.goods!.chassisNumber,
      BL_Number: d.goods!.blNumber,
      Aging: d.goods!.aging,
    }))
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Picking List')
    XLSX.writeFile(workbook, `Picking_List_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const scrollToZone = (zoneId: string) => {
    const el = document.getElementById(`zone-container-${zoneId}`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  // --- REUSABLE COMPONENT: SLOT SQUARE ---
  function SlotSquare({ slot }: { slot: Slot }) {
    const matched = isMatched(slot)
    return (
      <div
        id={`slot-${slot.zone}-${slot.row}-${slot.lane}`}
        onClick={() => slot.goods && setSelected(slot.goods)}
        className={`
          w-5 h-5 md:w-6 md:h-6 rounded-[4px] transition-all duration-300 relative group
          ${slot.goods ? 'cursor-pointer hover:scale-125 hover:z-20 shadow-sm' : 'cursor-default'}
          ${matched ? 'ring-4 ring-yellow-400 z-30 scale-150 shadow-xl animate-bounce' : ''}
        `}
        style={{ backgroundColor: getColor(slot) }}
      >
        {slot.goods && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
            <div className="bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-2xl">
              Loc: {slot.zone}-{slot.row}-{slot.lane} | {slot.goods.engineNumber}
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- REUSABLE COMPONENT: ZONE RENDERER ---
  const renderZone = (name: string, label: string, colorClass: string) => {
    const zoneData = data.filter(d => d.zone === name)
    const rows = [...new Set(zoneData.map(d => d.row))].sort((a, b) => a - b)
    const maxLanes = Math.max(...zoneData.map(d => d.lane), 0)

    return (
      <div id={`zone-container-${name}`} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className={`w-2 h-6 ${colorClass} rounded-full`} />
              <span className="text-lg font-black text-slate-800 tracking-tighter uppercase">{label}</span>
           </div>
           <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
             {zoneData.filter(s => s.goods).length} UNITS OCCUPIED
           </span>
        </div>

        <div className="relative inline-block">
          <div className="flex ml-8 mb-2">
            {Array.from({length: maxLanes}).map((_, i) => (
              <div key={i} className="w-5 md:w-6 text-[9px] font-black text-slate-300 text-center">{i+1}</div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {rows.map(row => (
              <div key={row} className="flex gap-1.5 items-center">
                <div className="w-8 text-[10px] font-black text-slate-400 text-right pr-2">R{row}</div>
                {zoneData.filter(d => d.row === row).map(slot => (
                  <SlotSquare key={`${slot.zone}${slot.row}${slot.lane}`} slot={slot} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans antialiased text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto mb-8 bg-white/80 backdrop-blur-xl border border-white p-6 rounded-[3rem] shadow-2xl shadow-slate-200/60 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-200 rotate-3">
            <MapIcon size={28} className="text-white -rotate-3" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none text-slate-800">YARD INTELLIGENCE</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live FIFO Monitoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              placeholder="Search Engine / Chassis / BL..." 
              className="pl-11 pr-4 py-3.5 bg-slate-100 border-none rounded-[1.2rem] text-xs font-bold w-full lg:w-64 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="h-10 w-[1px] bg-slate-200 hidden md:block mx-2" />

          <button onClick={exportPickingList} className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3.5 rounded-[1.2rem] text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-200">
            <FileDown size={16} /> EXPORT LIST
          </button>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1600px] mx-auto mb-8">
        <StatCard title="Yard Capacity" value={data.length} icon={<LayoutGrid size={18}/>} color="bg-blue-500" />
        <StatCard title="Occupied" value={data.filter(s => s.goods).length} icon={<CheckCircle2 size={18}/>} color="bg-emerald-500" />
        <StatCard title="Aging > 7 Days" value={data.filter(s => (s.goods?.aging || 0) > 7).length} icon={<AlertCircle size={18}/>} color="bg-rose-500" />
        <StatCard title="Utilization" value={`${Math.round((data.filter(s => s.goods).length / (data.length || 1)) * 100)}%`} icon={<TrendingUp size={18}/>} color="bg-indigo-500" />
      </div>

      {/* FILTER & ZONE NAV BAR */}
      <div className="max-w-[1600px] mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-[10px] font-black text-slate-400 mr-2">GO TO:</span>
          {['A', 'B', 'C', 'D', 'E'].map(z => (
            <button key={z} onClick={() => scrollToZone(z)} className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-[10px] font-black text-slate-600 transition-colors border border-slate-100">ZONE {z}</button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* LEGEND (New) */}
          <div className="flex items-center gap-4 mr-4 border-r pr-4 border-slate-200">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
                <span className="text-[8px] font-bold text-slate-500">OLDEST</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black rounded-sm" />
                <span className="text-[8px] font-bold text-slate-500">NEWEST</span>
             </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[0, 3, 7, 14].map(v => (
              <button 
                key={v}
                onClick={() => setAgingFilter(v)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${agingFilter === v ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v === 0 ? 'ALL AGING' : `>${v}D`}
              </button>
            ))}
          </div>
          <select 
              className="bg-slate-100 text-[10px] font-black px-4 py-2.5 rounded-xl outline-none cursor-pointer text-slate-600 border-none focus:ring-2 focus:ring-indigo-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">ALL STATUS</option>
              <option value="INCOMING">INCOMING</option>
              <option value="REPAIR">REPAIR</option>
              <option value="READY">READY</option>
          </select>
        </div>
      </div>

      {/* MAP AREA */}
      <div ref={scrollContainerRef} className="max-w-[1600px] mx-auto flex gap-8 overflow-x-auto pb-12 pt-4 scrollbar-hide">
        <div className="animate-in slide-in-from-left duration-700">
          {renderZone('E', 'PDI Area (E)', 'bg-indigo-500')}
        </div>

        <div className="flex flex-col gap-8 animate-in slide-in-from-bottom duration-1000">
          <div className="flex gap-8">
            {renderZone('D', 'Zone D', 'bg-emerald-500')}
            {renderZone('C', 'Zone C', 'bg-emerald-500')}
          </div>
          
          <div className="relative h-24 w-full flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-200/40 rounded-[3rem] border-4 border-dashed border-slate-300/50" />
            <div className="flex items-center gap-8 z-10 opacity-20">
               <Navigation size={24} className="text-slate-400 -rotate-90" />
               <span className="text-sm font-black text-slate-500 tracking-[2em] uppercase">Logistics Main Road</span>
               <Navigation size={24} className="text-slate-400 -rotate-90" />
            </div>
          </div>

          <div className="flex gap-8">
            {renderZone('B', 'Zone B', 'bg-emerald-500')}
            {renderZone('A', 'Zone A', 'bg-emerald-500')}
          </div>
        </div>
      </div>

      {/* FLOATING DETAIL CARD */}
      {selected && (
        <div className="fixed bottom-10 right-10 w-80 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden z-[100] animate-in zoom-in-90 slide-in-from-bottom-10 duration-300">
          <div className="bg-slate-900 p-6 pb-10 relative">
            <button onClick={() => setSelected(null)} className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <X size={18} />
            </button>
            <span className="bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
               {selected.brand}
            </span>
            <h3 className="text-white text-2xl font-black mt-4 tracking-tighter uppercase">{selected.engineNumber}</h3>
            <p className="text-slate-400 text-[10px] font-mono mt-1">{selected.chassisNumber}</p>
          </div>
          
          <div className="p-8 -mt-8 bg-white rounded-t-[3rem] space-y-4">
             {/* BL Number Section */}
             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <FileText size={16} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">BL Number</p>
                  <p className="text-xs font-bold text-slate-700">{selected.blNumber || 'N/A'}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Aging Time</p>
                   <p className="text-xl font-black text-rose-500">{selected.aging} <span className="text-xs">Days</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">FIFO Rank</p>
                   <p className="text-xl font-black text-slate-700">#{selected.fifoRank}</p>
                </div>
             </div>

             <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 size={16} />
                   </div>
                   <span className="text-xs font-black text-emerald-700 uppercase">{selected.status}</span>
                </div>
                <button className="text-[10px] font-black text-indigo-600 hover:underline">HISTORY</button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({title, value, icon, color}: any) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg shadow-slate-100`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{title}</p>
        <p className="text-xl font-black text-slate-800 tracking-tighter">{value}</p>
      </div>
    </div>
  )
}