'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import * as XLSX from 'xlsx'
import { 
  Search, 
  FileDown, 
  X, 
  Map as MapIcon, 
  Filter,
  CheckCircle2,
  Clock,
  LayoutGrid,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface Goods {
  id: string
  status: string
  fifoRank: number | null
  aging: number
  brand: string
  engineNumber: string
  chassisNumber: string
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get('/goods/heatmap')
      setData(res.data)
    } catch (err) {
      console.error("Error fetching heatmap:", err)
    }
  }

  const getRedWhiteColor = (ratio: number) => {
    const red = 239 // rose-500 base
    const greenBlue = Math.floor(255 * ratio)
    return `rgb(${red},${greenBlue},${greenBlue})`
  }

  const getColor = (slot: Slot) => {
    if (!slot.isActive) return '#F8FAFC' // slate-50
    if (!slot.goods) return '#E2E8F0' // slate-200
    if (agingFilter > 0 && slot.goods.aging <= agingFilter) return '#CBD5E1' // slate-300 (faded)
    if (statusFilter !== 'ALL' && slot.goods.status !== statusFilter) return '#CBD5E1'

    const ranks = data.filter(d => d.goods?.fifoRank).map(d => d.goods!.fifoRank!)
    const maxRank = Math.max(...ranks, 1)
    const ratio = (slot.goods.fifoRank || maxRank) / maxRank
    return getRedWhiteColor(ratio)
  }

  const isMatched = (slot: Slot) => {
    if (!slot.goods || !search) return false
    const keyword = search.toLowerCase()
    return (
      slot.goods.engineNumber.toLowerCase().includes(keyword) ||
      slot.goods.chassisNumber.toLowerCase().includes(keyword) ||
      slot.goods.brand?.toLowerCase().includes(keyword)
    )
  }

  const exportPickingList = () => {
    const input = prompt('Berapa unit mau dikeluarkan (berdasarkan FIFO)?')
    if (!input) return
    const qty = Number(input)
    if (isNaN(qty) || qty <= 0) {
      alert('Jumlah tidak valid')
      return
    }
    const readyGoods = data.filter(d => d.goods)
    const sorted = readyGoods.sort((a, b) => (a.goods!.fifoRank || 9999) - (b.goods!.fifoRank || 9999))
    const selectedUnits = sorted.slice(0, qty)
    const rows = selectedUnits.map((d, index) => ({
      No: index + 1,
      Location: `${d.zone}-${d.row}-${d.lane}`,
      Brand: d.goods!.brand,
      Engine: d.goods!.engineNumber,
      Chassis: d.goods!.chassisNumber,
      Aging: d.goods!.aging,
    }))
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Picking List')
    XLSX.writeFile(workbook, `Picking_List_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const renderZoneE = () => {
    const zoneData = data.filter(d => d.zone === 'E')
    const rows = [...new Set(zoneData.map(d => d.row))].sort((a, b) => a - b)
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-3 px-1">
           <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
           <span className="text-[10px] font-black text-slate-700 tracking-tighter uppercase">PDI Area (E)</span>
        </div>
        <div className="flex flex-col gap-1">
          {rows.map(row => (
            <div key={row} className="flex gap-1">
              {zoneData.filter(d => d.row === row).map(slot => (
                <SlotSquare key={`${slot.zone}${slot.row}${slot.lane}`} slot={slot} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderHorizontalZone = (name: string) => {
    const zoneData = data.filter(d => d.zone === name)
    const rows = [...new Set(zoneData.map(d => d.row))].sort((a, b) => a - b)
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-3 px-1">
           <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
           <span className="text-[10px] font-black text-slate-700 tracking-tighter uppercase">Zone {name}</span>
        </div>
        <div className="flex flex-col gap-1">
          {rows.map(row => (
            <div key={row} className="flex gap-1">
              {zoneData.filter(d => d.row === row).map(slot => (
                <SlotSquare key={`${slot.zone}${slot.row}${slot.lane}`} slot={slot} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  function SlotSquare({ slot }: { slot: Slot }) {
    const matched = isMatched(slot)
    return (
      <div
        onClick={() => slot.goods && setSelected(slot.goods)}
        className={`
          w-3 h-3 md:w-4 md:h-4 rounded-[2px] transition-all duration-300 relative group
          ${slot.goods ? 'cursor-pointer hover:scale-125 hover:z-20' : 'cursor-default'}
          ${matched ? 'ring-2 ring-emerald-400 ring-offset-1 z-30 scale-125 shadow-lg shadow-emerald-200' : ''}
        `}
        style={{ backgroundColor: getColor(slot) }}
      >
        {matched && <div className="absolute inset-0 bg-emerald-400 animate-pulse rounded-[2px]" />}
        
        {/* Simple Tooltip on Hover */}
        {slot.goods && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
            <div className="bg-slate-900 text-white text-[8px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
              {slot.goods.engineNumber}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 font-sans antialiased text-slate-900">
      {/* GLOSSY HEADER BAR */}
      <div className="max-w-[1600px] mx-auto mb-8 bg-white/70 backdrop-blur-md border border-white/40 p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
            <MapIcon size={24} className="text-white -rotate-3" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none text-slate-800">YARD INTELLIGENCE</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time FIFO Heatmap</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SEARCH BOX */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
            <input 
              placeholder="Quick search..." 
              className="pl-9 pr-4 py-2.5 bg-slate-100/50 border-none rounded-2xl text-[11px] font-bold w-40 focus:w-60 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block mx-1" />

          {/* STATUS FILTER */}
          <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-2xl">
            <select 
              className="bg-transparent text-[10px] font-black px-3 py-1.5 outline-none cursor-pointer text-slate-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">ALL</option>
              <option value="INCOMING">INCOMING</option>
              <option value="REPAIR">REPAIR</option>
              <option value="READY">READY</option>
            </select>
          </div>

          {/* AGING PILLS */}
          <div className="flex bg-slate-100/50 p-1 rounded-2xl">
            {[0, 3, 7, 14].map(v => (
              <button 
                key={v}
                onClick={() => setAgingFilter(v)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${agingFilter === v ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v === 0 ? 'ALL' : `>${v}D`}
              </button>
            ))}
          </div>

          <button onClick={exportPickingList} className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200">
            <FileDown size={14} /> EXPORT LIST
          </button>
        </div>
      </div>

      {/* LEGEND BAR */}
      <div className="max-w-[1600px] mx-auto mb-6 flex gap-6 px-2">
         <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 tracking-widest uppercase">
            <div className="w-2 h-2 bg-rose-500 rounded-full" /> Oldest Unit
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 tracking-widest uppercase">
            <div className="w-2 h-2 bg-white border border-slate-300 rounded-full" /> Newest Unit
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 tracking-widest uppercase">
            <div className="w-2 h-2 bg-slate-300 rounded-full" /> Filtered Out
         </div>
      </div>

      {/* MAIN MAP AREA */}
      <div className="max-w-[1600px] mx-auto flex gap-8 overflow-x-auto pb-12 pt-2 scrollbar-hide">
        {/* West Side (E) */}
        <div className="shrink-0 animate-in slide-in-from-left duration-700">
          {renderZoneE()}
        </div>

        {/* East Side (D, C, Main Road, B, A) */}
        <div className="flex flex-col gap-8 animate-in slide-in-from-bottom duration-700">
          <div className="flex flex-col gap-6">
            {renderHorizontalZone('D')}
            {renderHorizontalZone('C')}
          </div>
          
          {/* STYLIZED ROADWAY */}
          <div className="relative h-16 w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-slate-200/50 rounded-3xl border-2 border-dashed border-slate-300/60" />
            <div className="flex items-center gap-4 z-10 opacity-30">
               <TrendingUp size={16} className="text-slate-400" />
               <span className="text-[12px] font-black text-slate-400 tracking-[1.5em] uppercase">Logistics Access Road</span>
               <TrendingUp size={16} className="text-slate-400 rotate-180" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {renderHorizontalZone('B')}
            {renderHorizontalZone('A')}
          </div>
        </div>
      </div>

      {/* FLOATING DETAIL CARD */}
      {selected && (
        <div className="fixed bottom-8 right-8 w-72 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden z-[100] animate-in zoom-in-90 slide-in-from-bottom-10 duration-300">
          <div className="bg-slate-900 p-5 pb-8 relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <X size={16} />
            </button>
            <span className="bg-indigo-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
               {selected.brand}
            </span>
            <h3 className="text-white text-xl font-black mt-3 tracking-tighter">{selected.engineNumber}</h3>
          </div>
          
          <div className="p-6 -mt-6 bg-white rounded-t-[2rem] space-y-4">
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase">Aging</p>
                   <p className="text-sm font-black text-rose-500">{selected.aging} Days</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase">FIFO Rank</p>
                   <p className="text-sm font-black text-slate-700">#{selected.fifoRank}</p>
                </div>
             </div>
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-emerald-500" />
                   <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{selected.status}</span>
                </div>
                <AlertCircle size={16} className="text-slate-300" />
             </div>
          </div>
        </div>
      )}
    </div>
  )
}