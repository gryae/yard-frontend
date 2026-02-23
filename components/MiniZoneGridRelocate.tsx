'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { MapPin, Check, Lock, Info, MoveRight } from 'lucide-react'

interface Slot {
  id: string
  row: number
  lane: number
  occupied: boolean
  isActive: boolean
}

interface MiniZoneGridProps {
  zone: string
  onSelect: (row: number, lane: number) => void
  currentLocation?: {
    zone: string
    row: number
    lane: number
  } | null
}

export default function MiniZoneGrid({
  zone,
  onSelect,
  currentLocation,
}: MiniZoneGridProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!zone) return
    axios
      .get('/location/zone-map', { params: { zone } })
      .then((res) => setSlots(res.data))
  }, [zone])

  const rows = [...new Set(slots.map((s) => s.row))].sort((a, b) => a - b)

  return (
    <div className="mt-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-5">
      
      {/* HEADER & LEGEND */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} className="text-blue-500" />
            Yard Map: Zone {zone}
          </h3>
        </div>

        <div className="flex flex-wrap gap-3 py-2 px-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <LegendItem color="bg-gray-100 border-gray-200" label="Empty" />
          <LegendItem color="bg-gray-400" label="Full" />
          <LegendItem color="bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" label="Current Pos" isCurrent />
          <LegendItem color="bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" label="Target" />
        </div>
      </div>

      {/* GRID SCROLL AREA */}
      <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="flex flex-col gap-4 min-w-max">
          {rows.map((row) => {
            const rowSlots = slots
              .filter((s) => s.row === row)
              .sort((a, b) => a.lane - b.lane)

            return (
              <div key={row} className="flex items-center gap-4">
                {/* Row Indicator */}
                <div className="w-10 h-10 flex items-center justify-center bg-gray-900 rounded-xl text-[10px] font-black text-white shrink-0 shadow-md">
                  R{row}
                </div>

                {/* Lanes */}
                <div className="flex gap-2">
                  {rowSlots.map((slot) => {
                    const key = `${slot.row}-${slot.lane}`
                    const isSelected = selected === key
                    const isCurrent = 
                      currentLocation?.zone === zone && 
                      currentLocation?.row === slot.row && 
                      currentLocation?.lane === slot.lane

                    const isDisabled = (slot.occupied || !slot.isActive) && !isCurrent

                    // Dynamic Styling Logic
                    let boxStyle = "bg-white border-2 border-gray-100 text-gray-600"
                    if (!slot.isActive) boxStyle = "bg-gray-200 border-transparent text-gray-400 opacity-40 cursor-not-allowed"
                    else if (slot.occupied && !isCurrent) boxStyle = "bg-gray-400 border-transparent text-white cursor-not-allowed"
                    else if (isSelected) boxStyle = "bg-green-500 border-green-200 text-white shadow-lg shadow-green-200 ring-2 ring-green-100 scale-110 z-10"
                    else if (isCurrent) boxStyle = "bg-blue-500 border-blue-200 text-white shadow-lg shadow-blue-200 animate-pulse ring-2 ring-blue-100"

                    return (
                      <button
                        key={slot.id}
                        disabled={isDisabled}
                        onClick={() => {
                          if (isCurrent) return // Can't select current as target
                          setSelected(key)
                          onSelect(slot.row, slot.lane)
                        }}
                        className={`
                          relative w-11 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-300
                          ${boxStyle}
                          ${!isDisabled && !isSelected && !isCurrent ? 'hover:border-blue-400 active:scale-90' : ''}
                        `}
                      >
                        <span className={`text-[8px] uppercase opacity-60 ${isSelected || isCurrent ? 'text-white' : ''}`}>Lane</span>
                        {slot.lane}
                        
                        {/* Status Icons */}
                        {slot.occupied && !isCurrent && <Lock size={10} className="absolute top-1 right-1 opacity-40" />}
                        {isSelected && <Check size={12} strokeWidth={4} className="mt-1" />}
                        {isCurrent && <Info size={12} strokeWidth={4} className="mt-1" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <div className="w-4 h-[2px] bg-gray-200" />
        Swipe to see more lanes
        <div className="w-4 h-[2px] bg-gray-200" />
      </div>
    </div>
  )
}

// Helper Legend Component
function LegendItem({ color, label, isCurrent = false }: { color: string, label: string, isCurrent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3.5 h-3.5 rounded-md ${color}`} />
      <span className={`text-[10px] font-bold uppercase tracking-tight ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}