'use client'

import { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import axios from '@/lib/axios'
import { useRouter } from 'next/navigation'
import MiniZoneGrid from '@/components/MiniZoneGridRelocate'
import { 
  QrCode, 
  ArrowRight, 
  MapPin, 
  RotateCw, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  History,
  Clock,
} from 'lucide-react'

export default function ScanPage() {
  const [goods, setGoods] = useState<any>(null)
  const [showRelocate, setShowRelocate] = useState(false)
  const [zone, setZone] = useState('')
  const [row, setRow] = useState<number | null>(null)
  const [lane, setLane] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    if (goods) return
    if (scannerRef.current) return

    // Konfigurasi scanner dengan UI yang lebih bersih
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      },
      false
    )

    scannerRef.current = scanner
    scanner.render(
      async (decodedText) => {
        setLoading(true)
        try {
          await scanner.clear()
          scannerRef.current = null
          const res = await axios.get(`/goods/scan/${decodedText}`)
          setGoods(res.data)
        } catch (err) {
          alert('QR tidak valid atau unit tidak ditemukan')
          // Restart scanner jika gagal
          window.location.reload() 
        } finally {
          setLoading(false)
        }
      },
      () => {}
    )

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [goods])

  const handleAction = async () => {
    if (!goods) return
    const status = goods.currentStatus

    if (status === 'INCOMING') return router.push(`/pdi/${goods.id}`)
    if (status === 'REPAIR') return router.push(`/repair/${goods.id}`)
    if (status === 'PDI') return router.push(`/delivery/${goods.id}`)
    if (status === 'READY') {
      const res = await axios.get(`/delivery/by-goods/${goods.id}`)
      
      if (res.data.exists) {
        router.push(`/delivery/${res.data.deliveryId}`)
      } else {
        router.push(`/delivery/create?goodsId=${goods.id}`)
      }
      return
    }
    if (status === 'DELIVERED') {
      const res = await axios.get(`/delivery/by-goods/${goods.id}`)
      if (res.data?.exists && res.data?.deliveryId){
      router.push(`/delivery/${res.data.deliveryId}`)
      } else {
        alert('Delivery Data not found')
      }
      return
    }
    if (status === 'RECEIVED') return alert('Menunggu admin COMPLETE')
    if (status === 'COMPLETED') return alert('Unit sudah selesai')
  }

  const getNextProcess = () => {
    if (!goods) return ''
    switch (goods.currentStatus) {
      case 'INCOMING': return 'Proceed to PDI'
      case 'REPAIR': return 'Fill Repair Form'
      case 'PDI': return 'Ready for Delivery'
      case 'READY': return 'Create Delivery'
      case 'DELIVERED': return 'Waiting for Receiver'
      case 'RECEIVED': return 'Wait Admin Completion'
      case 'COMPLETED': return 'Unit Finished'
      default: return '-'
    }
  }

  const handleRelocate = async () => {
    if (!goods || !zone || !row || !lane) return alert('Pilih lokasi lengkap dulu')
    try {
      await axios.patch(`/goods/${goods.id}/relocate`, { zone, row, lane })
      alert('Relocation success')
      const res = await axios.get(`/goods/scan/${goods.qrCode}`)
      setGoods(res.data)
      setShowRelocate(false)
      setZone(''); setRow(null); setLane(null)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Relocate failed')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10">
      {/* INJECT CSS DI SINI */}
      <style jsx global>{`
        #reader { border: none !important; background: black !important; }
        #reader__dashboard_section_csr { padding: 20px !important; }
        #reader span, #reader b { color: white !important; font-size: 14px !important; }
        #reader button { 
          background: #2563eb !important; color: white !important; 
          border-radius: 10px !important; padding: 10px 20px !important;
          border: none !important; text-transform: uppercase; font-size: 12px;
          font-weight: bold; margin-bottom: 10px;
        }
        #reader img { display: none; } /* sembunyikan icon gambar bawaan jika ada */
      `}</style>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <QrCode size={20} />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Unit Scanner</h1>
      </div>

      {/* SCANNER WINDOW */}
      {!goods && (
        <div className="relative">
          <div id="reader" className="overflow-hidden rounded-2xl border-4 border-white shadow-xl bg-black" />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 animate-pulse">Posisikan QR Code di dalam kotak</p>
          </div>
        </div>
      )}

      {/* RESULT CARD */}
      {goods && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-blue-50 overflow-hidden">
            {/* Unit Header */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Unit Detected</p>
                  <h2 className="text-xl font-black">{goods.unit.brand}</h2>
                  <p className="text-sm font-mono opacity-80">{goods.unit.engineNumber}</p>
                </div>
                <Truck size={32} className="opacity-40" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Current Status</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold">
                    <RotateCw size={12} className="animate-spin-slow" />
                    {goods.currentStatus}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                    <MapPin size={14} className="text-red-500" />
                    {goods.location ? `${goods.location.zone}-${goods.location.row}-${goods.location.lane}` : 'NONE'}
                  </div>
                </div>
              </div>

              {/* Next Process Hint */}
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-center gap-3">
                <div className="bg-green-500 text-white p-2 rounded-xl">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-green-600 uppercase">Next Step</p>
                  <p className="text-sm font-bold text-green-900">{getNextProcess()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAction}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Lanjut ke Proses
                  <ArrowRight size={20} />
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRelocate(true)}
                    className="flex-1 bg-white border-2 border-orange-100 text-orange-600 font-bold py-3 rounded-2xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin size={18} />
                    Relokasi
                  </button>
                  <button
                    onClick={() => setGoods(null)}
                    className="px-6 bg-gray-50 text-gray-400 font-bold py-3 rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    Reset
                  </button>
                </div>

                {/* ACTIVITY HISTORY */}
{goods.logs && goods.logs.length > 0 && (
  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
    
    <div className="flex items-center gap-2 border-b pb-2 border-gray-100">
      <History size={18} className="text-blue-500" />
      <h3 className="font-bold text-gray-800">
        Unit Activity History
      </h3>
    </div>

    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
      {goods.logs.map((log: any) => (
        <div
          key={log.id}
          className="relative pl-6 border-l-2 border-gray-100 pb-2"
        >
          <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-100 border-2 border-blue-500" />

          <div className="text-sm font-bold text-gray-800">
            {log.action}
          </div>

          <div className="text-xs text-gray-500 mb-1">
            {log.fromStatus || 'START'} → {log.toStatus || 'END'}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-50 w-fit px-2 py-0.5 rounded">
            <Clock size={10} />
            {new Date(log.createdAt).toLocaleString()} •{' '}
            {log.user?.name || 'System'}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RELOCATE MODAL */}
      {showRelocate && goods && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Relocate Unit</h2>
                <p className="text-sm text-gray-500">Move unit to a new yard position</p>
              </div>
              <button onClick={() => setShowRelocate(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Select Zone</label>
                <div className="grid grid-cols-5 gap-2">
                  {['A', 'B', 'C', 'D', 'E'].map((z) => (
                    <button
                      key={z}
                      onClick={() => { setZone(z); setRow(null); setLane(null); }}
                      className={`py-3 rounded-xl font-bold transition-all border-2 ${
                        zone === z 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              {zone && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 overflow-hidden">
                  <MiniZoneGrid
                    zone={zone}
                    currentLocation={goods.location ? { zone: goods.location.zone, row: goods.location.row, lane: goods.location.lane } : null}
                    onSelect={(r, l) => { setRow(r); setLane(l); }}
                  />
                </div>
              )}

              {row && lane && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700 font-semibold tracking-wide">Target Position:</span>
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-lg font-black">{zone}-{row}-{lane}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRelocate(false)}
                  className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRelocate}
                  disabled={!row || !lane}
                  className="flex-[2] bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-95"
                >
                  Confirm Move
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function X({size}: {size:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
}