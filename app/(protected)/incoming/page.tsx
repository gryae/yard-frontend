'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import MiniZoneGrid from '@/components/MiniZoneGrid'
import { 
  Search, 
  Truck, 
  ClipboardCheck, 
  MapPin, 
  Camera, 
  Printer, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  X
} from 'lucide-react'

export default function IncomingPage() {
  const router = useRouter()
  const API = process.env.NEXT_PUBLIC_API_URL

  const [engineSearch, setEngineSearch] = useState('')
  const [engineOptions, setEngineOptions] = useState<any[]>([])
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)

  const [zone, setZone] = useState('')
  const [row, setRow] = useState<number | ''>('')
  const [lane, setLane] = useState<number | ''>('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreview, setPhotoPreview] = useState<string[]>([])
  const [inspectionData, setInspectionData] = useState<any[]>([])

  const inspectionTemplate = [
    { category: 'Body & Panel', items: ['Penyok (Dent)', 'Tergores (Scratch)', 'Lecet (Scuff)', 'Retak (Crack)', 'Bengkok / Tidak Presisi', 'Cat Mengelupas', 'Karat / Korosi'] },
    { category: 'Bumper', items: ['Bumper Depan', 'Bumper Belakang'] },
    { category: 'Kaca & Lampu', items: ['Kaca Depan', 'Kaca Belakang', 'Kaca Samping', 'Lampu Depan', 'Lampu Belakang', 'Lampu Sein'] },
    { category: 'Spion & Aksesori', items: ['Spion Kanan', 'Spion Kiri', 'Wiper', 'Emblem / List Body'] },
    { category: 'Ban & Velg', items: ['Ban', 'Velg'] },
  ]

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) { window.location.reload(); return }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    if (engineSearch.length < 2) { setEngineOptions([]); return }
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/master/search`, { params: { q: engineSearch } })
        //console.log('SEARCH RESULT ',res.data)
        setEngineOptions(res.data)
      } catch (err) { console.error(err) }
    }, 300)
    return () => clearTimeout(timeout)
  }, [engineSearch])

  useEffect(() => {
    const initial: any[] = []
    inspectionTemplate.forEach(section => {
      section.items.forEach(item => {
        initial.push({ category: section.category, itemName: item, status: 'OK', source: '', note: '' })
      })
    })
    setInspectionData(initial)
  }, [])

  // PATCHED: Logic Photo Change agar Stacking & No Replace
  const handlePhotoChange = (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    const validImages = files.filter(file => file.type.startsWith('image/'));

    // Tambahkan file baru ke array lama
    setPhotos((prev) => [...prev, ...validImages]);

    // Tambahkan preview baru ke preview lama
    const newPreviews = validImages.map((file) => URL.createObjectURL(file));
    setPhotoPreview((prev) => [...prev, ...newPreviews]);
    
    // Reset input value supaya bisa pilih file yang sama lagi
    e.target.value = '';
  };

  const handlePrintQR = () => {
    if (!qrImage || !selectedUnit) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Print QR</title><style>body { text-align: center; font-family: sans-serif; padding: 20px; } img { width: 250px; } .text { font-size: 16px; font-weight: bold; margin: 5px 0; }</style></head>
        <body>
          <img id="qrImg" src="${qrImage}" />
          <div class="text">${selectedUnit.engineNumber}</div>
          <div class="text">${selectedUnit.chassisNumber}</div>
          <div class="text">${new Date().toLocaleString()}</div>
          <script>const img = document.getElementById('qrImg'); img.onload = function() { window.print(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleSubmit = async () => {
    if (!selectedUnit) return alert('Select engine first')
    if (!zone || !row || !lane) return alert('Select full location')
    try {
      setLoading(true)
      const res = await axios.post(`${API}/goods/incoming`, {
        engineNumber: selectedUnit.engineNumber,
        zone, row: Number(row), lane: Number(lane),
        inspectionItems: inspectionData,
        photos: [],
      })
      const goodsId = res.data.goods.id
      if (photos.length > 0) {
        const formData = new FormData()
        photos.forEach((file) => formData.append('files', file))
        formData.append('process', 'INCOMING')
        await axios.post(`${API}/photos/${goodsId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setQrImage(res.data.qrImage)
      setCountdown(10)
      if (res.data.autoRepair) alert('⚠ Unit auto moved to REPAIR')
      alert('Incoming created successfully')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
          <Truck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Incoming Smart Form</h1>
          <p className="text-gray-500 font-medium">Pendaftaran Unit & Inspeksi Masuk</p>
        </div>
      </div>

      {/* SECTION 1: UNIT SELECTION */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-widest">
          <Search size={14} />
          Section A - Unit Identification
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">Engine Number</label>
            <div className="relative">
              <input
                value={engineSearch}
                onChange={(e) => setEngineSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono"
                placeholder="Search engine..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {engineOptions.length > 0 && (
              <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-52 overflow-auto p-2 space-y-1">
{engineOptions.map((item) => {
  const alreadyRegistered = !!item.currentStatus

  return (
    <button
      key={item.id}
      disabled={alreadyRegistered}
      className={`w-full text-left p-3 rounded-lg transition-colors font-mono text-sm flex items-center justify-between group
        ${alreadyRegistered
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'hover:bg-blue-50'}
      `}
      onClick={() => {
        if (alreadyRegistered) return

        setSelectedUnit(item)
        setEngineSearch(item.engineNumber)
        setEngineOptions([])
      }}
    >
<div className="flex items-center gap-15">
  <span>{item.engineNumber}</span>

  {item.currentStatus && (
    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">
      {item.currentStatus}
    </span>
  )}
</div>

      {!alreadyRegistered && (
        <CheckCircle2
          size={16}
          className="text-blue-500 opacity-0 group-hover:opacity-100"
        />
      )}
    </button>
  )
})}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Chassis Number</label>
            <input
              value={selectedUnit?.chassisNumber || ''}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono italic cursor-not-allowed"
              placeholder="Auto-filled..."
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: INSPECTION */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-widest">
          <ClipboardCheck size={14} />
          Section B - Inspection Checklist
        </div>
        <div className="space-y-4">
          {inspectionTemplate.map(section => (
            <div key={section.category} className="rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 font-bold text-gray-700 text-sm border-b flex justify-between">
                {section.category}
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border shadow-sm">
                  {section.items.length} Items
                </span>
              </div>
              <div className="p-4 space-y-4 divide-y divide-gray-50">
                {section.items.map(item => {
                  const row = inspectionData.find(d => d.itemName === item)
                  const isNotOk = row?.status === 'NOT_OK'
                  return (
                    <div key={item} className="pt-4 first:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      <div className="lg:col-span-3 font-semibold text-gray-700 text-sm pt-2">{item}</div>
                      <div className="lg:col-span-2">
                        <select
                          value={row?.status || 'OK'}
                          onChange={(e) => setInspectionData(prev => prev.map(d => d.itemName === item ? { ...d, status: e.target.value } : d))}
                          className={`w-full p-2.5 rounded-lg text-sm font-bold border-2 transition-all outline-none ${
                            isNotOk ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
                          }`}
                        >
                          <option value="OK">✅ OK</option>
                          <option value="NOT_OK">❌ NOT OK</option>
                        </select>
                      </div>
                      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          placeholder="Sumber (e.g. Loading)"
                          value={row?.source || ''}
                          onChange={(e) => setInspectionData(prev => prev.map(d => d.itemName === item ? { ...d, source: e.target.value } : d))}
                          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
                        />
                        <input
                          placeholder="Note detail..."
                          value={row?.note || ''}
                          onChange={(e) => setInspectionData(prev => prev.map(d => d.itemName === item ? { ...d, note: e.target.value } : d))}
                          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: LOCATION & PHOTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-widest">
            <MapPin size={14} />
            Section C - Yard Placement
          </div>
          <select
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10"
            value={zone}
            onChange={(e) => { setZone(e.target.value); setRow(''); setLane(''); }}
          >
            <option value="">Select Zone</option>
            {['A', 'B', 'C', 'D'].map(z => <option key={z} value={z}>Zone {z}</option>)}
            <option value="E">Zone E (PDI Area)</option>
          </select>
          {zone && <MiniZoneGrid zone={zone} onSelect={(r, l) => { setRow(r); setLane(l); }} />}
          {row && lane && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100 text-green-700 font-bold text-sm animate-in fade-in slide-in-from-left-2">
              <CheckCircle2 size={16} />
              Position: {zone} - Row {row} - Lane {lane}
            </div>
          )}
        </div>

        {/* PHOTO UPLOAD - SECTION D */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-widest">
            <Camera size={14} />
            Section D - Evidence Photos
          </div>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Camera size={24} className="text-gray-400 group-hover:text-blue-500 mb-2" />
              <p className="text-sm text-gray-500 font-medium">Capture or Upload Images</p>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/jpeg, image/png, image/webp, image/jpg" 
              className="hidden" 
              onChange={handlePhotoChange} 
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            {photoPreview.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border shadow-sm relative group">
                <img src={src} alt="preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => {
                    setPhotoPreview(prev => prev.filter((_, index) => index !== i));
                    setPhotos(prev => prev.filter((_, index) => index !== i));
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {photoPreview.length === 0 && (
              <div className="col-span-3 py-10 text-center text-gray-300 flex flex-col items-center">
                <ImageIcon size={32} strokeWidth={1} />
                <span className="text-[10px] uppercase font-bold tracking-widest mt-2">No Photos</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUBMIT ACTION */}
      <div className="flex flex-col items-center pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedUnit}
          className={`w-full max-md py-4 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
            loading || !selectedUnit 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
          }`}
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : <Truck size={24} />}
          {loading ? 'Submitting Data...' : 'Create Incoming Record'}
        </button>
      </div>

      {/* QR MODAL */}
      {qrImage && (
        <div className="bg-green-600 rounded-[40px] p-8 text-white shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-4 rounded-3xl shadow-inner">
              <img src={qrImage} alt="QR" className="w-48 h-48" />
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black">Incoming Successful!</h2>
              <p className="text-green-100 font-medium tracking-wide">ID: {selectedUnit?.engineNumber}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handlePrintQR} className="bg-white text-green-700 px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
              <Printer size={20} /> Print QR Sticker
            </button>
            <button onClick={() => window.location.reload()} className="bg-green-500/50 border border-green-400 px-8 py-3 rounded-2xl font-bold">
              Done
            </button>
          </div>
          {countdown !== null && (
            <div className="flex items-center justify-center gap-2 text-green-100 text-sm font-medium">
              <RefreshCw size={14} className="animate-spin" /> Refreshing in {countdown}s...
            </div>
          )}
        </div>
      )}
    </div>
  )
}