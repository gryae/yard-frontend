'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  ClipboardList, 
  MessageSquare, 
  Car, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Navigation,
  Search // Tambahin icon search
} from 'lucide-react'

export default function CreateDeliveryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">Loading...</div>}>
      <DeliveryFormContent />
    </Suspense>
  )
}

function DeliveryFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const goodsIdFromQuery = searchParams.get('goodsId')

  const [readyGoods, setReadyGoods] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  
  // NEW STATE UNTUK SEARCH
  const [searchTerm, setSearchTerm] = useState('')

  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [jenisPengiriman, setJenisPengiriman] = useState('')
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReadyGoods()
  }, [])

  const fetchReadyGoods = async () => {
    try {
      const res = await axios.get('/goods?status=READY')
      setReadyGoods(res.data)

      if (goodsIdFromQuery) {
        const found = res.data.find((g: any) => g.id === goodsIdFromQuery)
        if (found) {
          setSelected({
            goodsId: found.id,
            brand: found.unit?.brand,
            engine: found.unit?.engineNumber,
            chassis: found.unit?.chassisNumber,
            noPol: '',
            tujuanPengiriman: ''
          })
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err)
    }
  }

  const handleToggleSelect = (goods: any) => {
    if (selected?.goodsId === goods.id) {
      setSelected(null)
    } else {
      setSelected({
        goodsId: goods.id,
        brand: goods.unit?.brand,
        engine: goods.unit?.engineNumber,
        chassis: goods.unit?.chassisNumber,
        noPol: '',
        tujuanPengiriman: ''
      })
    }
  }

  const updateItemField = (field: string, value: string) => {
    setSelected((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!selected || !driverName || !jenisPengiriman) {
      alert("Mohon lengkapi data driver dan pilih unit.")
      return
    }

    try {
      setLoading(true)
      await axios.post('/delivery/create', {
        driverName,
        driverPhone,
        jenisPengiriman,
        catatan,
        items: [selected]
      })

      alert('Delivery Created Successfully')
      router.push('/delivery')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating delivery')
    } finally {
      setLoading(false)
    }
  }

  // LOGIC FILTERING
  const filteredGoods = readyGoods.filter((goods) => {
    const search = searchTerm.toLowerCase()
    return (
      goods.unit?.brand?.toLowerCase().includes(search) ||
      goods.unit?.engineNumber?.toLowerCase().includes(search) ||
      goods.unit?.chassisNumber?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Delivery</h1>
          <p className="text-gray-500 font-medium">Lengkapi detail pengiriman unit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: DRIVER INFO */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Truck size={20} strokeWidth={2.5} />
              <h2 className="font-black uppercase tracking-widest text-xs">Driver Information</h2>
            </div>

            <div className="space-y-4">
              <InputGroup label="Driver Name" icon={<User size={18}/>}>
                <input
                  placeholder="Nama Lengkap Sopir"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-semibold"
                />
              </InputGroup>

              <InputGroup label="Driver Phone" icon={<Phone size={18}/>}>
                <input
                  placeholder="0812xxxx"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-semibold"
                />
              </InputGroup>

              <InputGroup label="Jenis Pengiriman" icon={<ClipboardList size={18}/>}>
                <input
                  placeholder="Kirim Dealer / Customer"
                  value={jenisPengiriman}
                  onChange={(e) => setJenisPengiriman(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-semibold"
                />
              </InputGroup>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center gap-1.5">
                  <MessageSquare size={12} /> Catatan Tambahan
                </label>
                <textarea
                  rows={3}
                  placeholder="Opsional..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-semibold resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: UNIT SELECTION */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full max-h-[700px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Car size={20} strokeWidth={2.5} />
                <h2 className="font-black uppercase tracking-widest text-xs">Select Ready Unit</h2>
              </div>
              <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                {readyGoods.length} Units Ready
              </span>
            </div>

            {/* SEARCH BAR REVISION */}
            <div className="relative mb-4 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Cari Mesin / Brand..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 focus:bg-white outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
              {filteredGoods.map((goods) => {
                const isSelected = selected?.goodsId === goods.id
                return (
                  <div
                    key={goods.id}
                    onClick={() => handleToggleSelect(goods)}
                    className={`
                      relative p-4 rounded-2xl border-2 transition-all cursor-pointer group
                      ${isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' 
                        : 'border-gray-50 bg-gray-50/30 hover:border-indigo-200'}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className={`font-black tracking-tight transition-colors ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                          {goods.unit?.brand}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                          E: {goods.unit?.engineNumber}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 bg-white'
                      }`}>
                        {isSelected && <CheckCircle2 size={16} />}
                      </div>
                    </div>

                    {/* DETAIL INPUTS IF SELECTED */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-indigo-100 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-white p-3 rounded-xl border border-indigo-100">
                          <label className="text-[9px] font-black text-indigo-400 uppercase">No. Polisi</label>
                          <input
                            autoFocus
                            placeholder="B 1234 XXX"
                            value={selected.noPol}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateItemField('noPol', e.target.value)}
                            className="w-full bg-transparent outline-none text-sm font-bold placeholder:text-gray-300"
                          />
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-indigo-100">
                          <label className="text-[9px] font-black text-indigo-400 uppercase">Tujuan</label>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <input
                              placeholder="Alamat / Nama Dealer"
                              value={selected.tujuanPengiriman}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateItemField('tujuanPengiriman', e.target.value)}
                              className="w-full bg-transparent outline-none text-sm font-bold placeholder:text-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* EMPTY STATE */}
              {filteredGoods.length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <Search size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-black uppercase">Unit tidak ditemukan</p>
                </div>
              )}
            </div>
          </section>

          {/* SUBMIT ACTION */}
          <button
            onClick={handleSubmit}
            disabled={loading || !selected}
            className={`
              w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl
              ${loading || !selected 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'}
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2">Generating...</span>
            ) : (
              <>
                GENERATE SURAT JALAN
                <Navigation size={22} className="rotate-90" />
              </>
            )}
          </button>
          
          {!selected && (
            <div className="flex items-center justify-center gap-2 text-orange-500 bg-orange-50 py-2 rounded-xl border border-orange-100">
              <AlertCircle size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">Pilih 1 Unit Terlebih Dahulu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InputGroup({ label, children, icon }: { label: string, children: React.ReactNode, icon: any }) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-indigo-400 focus-within:bg-white transition-all group">
      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block group-focus-within:text-indigo-500">{label}</label>
      <div className="flex items-center gap-3 text-gray-700">
        <span className="text-gray-400 group-focus-within:text-indigo-500">{icon}</span>
        {children}
      </div>
    </div>
  )
}