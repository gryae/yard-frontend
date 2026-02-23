'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  ClipboardCheck, 
  User, 
  ShieldCheck, 
  Camera, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  X
} from 'lucide-react'

interface PDIItem {
  category: string
  itemName: string
  status: 'OK' | 'NG'
  note?: string
}

export default function PDIPage() {
  const router = useRouter()
  const params = useParams()
  const goodsId = params.id as string

  const [technicianName, setTechnicianName] = useState('')
  const [supervisorName, setSupervisorName] = useState('')
  const [loading, setLoading] = useState(false)

  // LOGIC FOTO BARU
  const [pdiPhotos, setPdiPhotos] = useState<File[]>([])
  const [pdiPreviews, setPdiPreviews] = useState<string[]>([])
  
  const [stickerPhotos, setStickerPhotos] = useState<File[]>([])
  const [stickerPreviews, setStickerPreviews] = useState<string[]>([])

  const checklistStructure = {
    'Body / Exterior': ['Pintu Depan', 'Pintu Bak Belakang', 'Tutup BBM', 'Remote', 'Spion kiri/kanan'],
    'Ruang Mesin': ['Voltase Battery', 'Kekencangan Terminal', 'Nomor Battery'],
    'Minyak / Oli': ['Oli Mesin', 'Air Radiator', 'Air Wiper', 'Oli Power Steering', 'Minyak Rem', 'Oli Kopling'],
    'Lampu-Lampu': ['Lampu Utama', 'Lampu Dim', 'Lampu Kabut', 'Lampu Belakang', 'Lampu Rem', 'Lampu Mundur', 'Lampu Hazard', 'Nomor Seri Ban'],
    'Fungsi Interior': ['Lampu Kabin Depan', 'Lampu Kabin Belakang', 'Lampu Kontak Ring Iluminasi', 'Catat Angka Kilometer', 'Klakson', 'Wiper', 'Kaca Pintu', 'Kursi'],
  }

  const initialItems: PDIItem[] = Object.entries(checklistStructure)
    .flatMap(([category, items]) =>
      items.map(item => ({
        category,
        itemName: item,
        status: 'OK' as 'OK' | 'NG',
        note: '',
      }))
    )

  const [items, setItems] = useState<PDIItem[]>(initialItems)

  // Handler Foto Unit (Multiple)
  const handlePdiPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setPdiPhotos(prev => [...prev, ...selectedFiles])
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
      setPdiPreviews(prev => [...prev, ...newPreviews])
    }
    e.target.value = '' // Reset input agar bisa pilih file yang sama
  }

  // Handler Foto Sticker (Multiple/Single stacking)
  const handleStickerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setStickerPhotos(prev => [...prev, ...selectedFiles])
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
      setStickerPreviews(prev => [...prev, ...newPreviews])
    }
    e.target.value = ''
  }

  // Delete Handlers
  const removePdiPhoto = (index: number) => {
    setPdiPhotos(prev => prev.filter((_, i) => i !== index))
    setPdiPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeStickerPhoto = (index: number) => {
    setStickerPhotos(prev => prev.filter((_, i) => i !== index))
    setStickerPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PDIItem, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleSubmit = async () => {
    if (pdiPhotos.length === 0) return alert('PDI photos required')
    if (stickerPhotos.length === 0) return alert('Sticker photo required')
    if (!technicianName || !supervisorName) return alert('Fill technician & supervisor name')

    try {
      setLoading(true)

      // 1. Upload PDI Photos
      const pdiFormData = new FormData()
      pdiPhotos.forEach(file => pdiFormData.append('files', file))
      pdiFormData.append('process', 'PDI')
      await axios.post(`/photos/${goodsId}`, pdiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // 2. Upload Sticker Photos
      const stickerFormData = new FormData()
      stickerPhotos.forEach(file => stickerFormData.append('files', file))
      stickerFormData.append('process', 'PDI_STICKER')
      await axios.post(`/photos/${goodsId}`, stickerFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // 3. Submit PDI Data
      const res = await axios.post(`/goods/${goodsId}/pdi`, {
        technicianName,
        supervisorName,
        items,
      })
      
      alert(res.data.message)
      router.push(`/dashboard`)
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* APP BAR */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-xl">
              <ClipboardCheck className="text-purple-600" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 uppercase">Pre-Delivery Inspection</h1>
              <p className="text-[10px] font-bold text-slate-400">UNIT ID: {goodsId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6 mt-4">
        {/* IDENTITAS */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase px-1">
              <User size={14} /> Nama Teknisi
            </label>
            <input
              placeholder="Input Nama Lengkap..."
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase px-1">
              <ShieldCheck size={14} /> Supervisor
            </label>
            <input
              placeholder="Input Nama Supervisor..."
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            />
          </div>
        </div>

        {/* CHECKLIST SECTIONS */}
        {Object.entries(checklistStructure).map(([category, itemList]) => (
          <div key={category} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
              <h2 className="font-black text-sm text-slate-700 uppercase tracking-wider">{category}</h2>
            </div>

            <div className="p-2 md:p-4 divide-y divide-slate-50">
              {items
                .map((item, index) => ({ item, index }))
                .filter(x => x.item.category === category)
                .map(({ item, index }) => (
                  <div key={index} className="py-4 px-2 hover:bg-slate-50/50 transition-colors rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">{item.itemName}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => updateItem(index, 'status', 'OK')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                              item.status === 'OK' 
                                ? 'bg-emerald-500 text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => updateItem(index, 'status', 'NG')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                              item.status === 'NG' 
                                ? 'bg-rose-500 text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            NG
                          </button>
                        </div>
                        
                        <input
                          placeholder="Catatan..."
                          value={item.note}
                          onChange={(e) => updateItem(index, 'note', e.target.value)}
                          className="flex-1 md:w-48 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:border-purple-300 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* UPLOAD SECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDI PHOTOS */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Camera className="text-blue-600" size={20} />
              </div>
              <p className="font-black text-sm text-slate-700 uppercase">Foto Kondisi Unit</p>
            </div>
            
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePdiPhotoChange}
                className="hidden"
              />
              <ImageIcon className="text-slate-300 mb-2 group-hover:scale-110 transition-transform" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                Klik untuk Ambil Foto
              </p>
            </label>

            {/* Previews List */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {pdiPreviews.map((src, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden relative border shadow-sm group">
                  <img src={src} className="w-full h-full object-cover" alt="pdi" />
                  <button 
                    type="button"
                    onClick={() => removePdiPhoto(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
                >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* STICKER PHOTO */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl">
                <CheckCircle2 className="text-amber-600" size={20} />
              </div>
              <p className="font-black text-sm text-slate-700 uppercase">Foto Sticker PDI</p>
            </div>

            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-amber-50/50 hover:border-amber-200 transition-all cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleStickerPhotoChange}
                className="hidden"
              />
              <ImageIcon className="text-slate-300 mb-2 group-hover:scale-110 transition-transform" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                Klik untuk Ambil Foto Sticker
              </p>
            </label>

            {/* Previews List */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {stickerPreviews.map((src, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden relative border shadow-sm group">
                  <img src={src} className="w-full h-full object-cover" alt="sticker" />
                  <button 
                    type="button"
                    onClick={() => removeStickerPhoto(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
                >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-[1.5rem] flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${
            loading 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Submit & Finalize Inspection
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}