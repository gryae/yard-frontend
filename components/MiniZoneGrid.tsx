'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { Check, Info, Lock } from 'lucide-react'

interface Slot {
  id: string
  row: number
  lane: number
  occupied: boolean
  isActive: boolean
}

export default function MiniZoneGrid({
  zone,
  onSelect,
}: {
  zone: string
  onSelect: (row: number, lane: number) => void
}) {
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
    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
      
      {/* HEADER & LEGEND */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Info size={14} />
          Select Slot in Zone {zone}
        </h3>
        
        <div className="flex gap-3 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm" />
            <span className="text-gray-500">Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded-sm" />
            <span className="text-gray-500">Full</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-600 rounded-sm" />
            <span className="text-blue-600">Selected</span>
          </div>
        </div>
      </div>

      {/* GRID CONTAINER - Mobile Friendly Scroll */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <div className="flex flex-col gap-3 min-w-max">
          {rows.map((row) => {
            const rowSlots = slots
              .filter((s) => s.row === row)
              .sort((a, b) => a.lane - b.lane)

            return (
              <div key={row} className="flex items-center gap-3">
                {/* Row Label */}
                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg text-[10px] font-black text-gray-500 shrink-0">
                  R{row}
                </div>

                {/* Slots */}
                <div className="flex gap-2">
                  {rowSlots.map((slot) => {
                    const key = `${slot.row}-${slot.lane}`
                    const isSelected = selected === key
                    const isDisabled = slot.occupied || !slot.isActive

                    return (
                      <button
                        key={slot.id}
                        disabled={isDisabled}
                        onClick={() => {
                          setSelected(key)
                          onSelect(slot.row, slot.lane)
                        }}
                        className={`
                          relative w-10 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-200
                          ${isDisabled 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60' 
                            : isSelected 
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-105 shadow-lg z-10' 
                              : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-blue-400 shadow-sm active:scale-90'
                          }
                        `}
                      >
                        <span className="text-[10px] opacity-50 font-normal mb-0.5">L</span>
                        {slot.lane}
                        
                        {/* Status Icon */}
                        {slot.occupied && (
                          <Lock size={10} className="absolute top-1 right-1 opacity-30" />
                        )}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 bg-white text-blue-600 rounded-full p-0.5 shadow-md border border-blue-100">
                            <Check size={8} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FOOTER HINT */}
      <p className="text-[10px] text-gray-400 italic text-center">
        * Swipe horizontal if rows are long
      </p>
    </div>
  )
}