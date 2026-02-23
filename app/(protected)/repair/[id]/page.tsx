'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  Wrench, 
  User, 
  Plus, 
  Camera, 
  Trash2, 
  ChevronRight, 
  AlertTriangle,
  FileText,
  Loader2,
  Image as ImageIcon,
  X
} from 'lucide-react'

interface RepairItem {
  category: string
  repairType: string
  detail: string
  action: string
}

export default function RepairPage() {
  const router = useRouter()
  const params = useParams()
  const goodsId = params.id as string

  const [technicianName, setTechnicianName] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<RepairItem[]>([
    { category: '', repairType: '', detail: '', action: '' }
  ])

  // --- LOGIC FOTO BARU ---
  const [repairPhotos, setRepairPhotos] = useState<File[]>([])
  const [repairPreviews, setRepairPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      // Stacking logic: gabung foto lama dengan yang baru
      setRepairPhotos(prev => [...prev, ...selectedFiles])
      
      // Buat preview URL
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
      setRepairPreviews(prev => [...prev, ...newPreviews])
    }
    e.target.value = '' // Reset agar bisa pilih file yang sama
  }

  const removePhoto = (index: number) => {
    setRepairPhotos(prev => prev.filter((_, i) => i !== index))
    setRepairPreviews(prev => prev.filter((_, i) => i !== index))
  }
  // -----------------------

  const addItem = () => {
    setItems([
      ...items,
      { category: '', repairType: '', detail: '', action: '' }
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updated = items.filter((_, i) => i !== index)
      setItems(updated)
    }
  }

  const updateItem = (index: number, field: keyof RepairItem, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const uploadPhotos = async () => {
    if (repairPhotos.length === 0) {
      throw new Error('Repair photos required')
    }
    const formData = new FormData()
    repairPhotos.forEach(file => {
      formData.append('files', file)
    })
    formData.append('process', 'REPAIR')
    await axios.post(`/photos/${goodsId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      // 1. Upload Photos (Required by Logic)
      await uploadPhotos()

      // 2. Submit Repair Data
      await axios.post(`/goods/${goodsId}/repair/form`, {
        formData: {
          technicianName,
          notes,
          items,
        }
      })

      // 3. Mark as Complete
      await axios.post(`/goods/${goodsId}/repair/complete`)

      alert('Repair Completed Successfully')
      router.push(`/dashboard`) // Redirect ke dashboard setelah sukses

    } catch (err: any) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] pb-20 font-sans">
      {/* HEADER BAR */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl">
              <Wrench className="text-amber-600" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 uppercase">Unit Repair Form</h1>
              <p className="text-[10px] font-bold text-slate-400">GOODS ID: {goodsId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6 mt-4">
        
        {/* TECHNICIAN & NOTES */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-amber-100 space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase px-1">
              <User size={14} className="text-amber-500" /> Nama Teknisi
            </label>
            <input
              placeholder="Masukkan nama teknisi..."
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-200 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase px-1">
              <FileText size={14} className="text-amber-500" /> Catatan Umum
            </label>
            <textarea
              placeholder="Berikan keterangan tambahan perbaikan..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-200 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* DYNAMIC REPAIR ITEMS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Daftar Perbaikan
            </h2>
            <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
              {items.length} ITEM
            </span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-[2rem] p-6 shadow-md border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Kategori</p>
                  <input
                    placeholder="Contoh: Body / Mesin"
                    value={item.category}
                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-amber-300 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Jenis Perbaikan</p>
                  <input
                    placeholder="Contoh: Cat Ulang / Ganti Part"
                    value={item.repairType}
                    onChange={(e) => updateItem(index, 'repairType', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-amber-300 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Detail Kerusakan</p>
                  <input
                    placeholder="Detail bagian yang rusak..."
                    value={item.detail}
                    onChange={(e) => updateItem(index, 'detail', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-amber-300 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Tindakan</p>
                  <input
                    placeholder="Apa yang dilakukan..."
                    value={item.action}
                    onChange={(e) => updateItem(index, 'action', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-amber-300 outline-none transition-all"
                  />
                </div>
              </div>

              {items.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-4 flex items-center gap-1 text-rose-500 text-[10px] font-black uppercase hover:text-rose-700 transition-colors"
                >
                  <Trash2 size={12} /> Hapus Item
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="w-full py-4 border-2 border-dashed border-amber-200 rounded-[1.5rem] flex items-center justify-center gap-2 text-amber-600 text-[11px] font-black uppercase hover:bg-amber-50 transition-all"
          >
            <Plus size={16} /> Tambah Item Perbaikan
          </button>
        </div>

        {/* PHOTO UPLOAD SECTION */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-2 rounded-xl">
              <Camera className="text-amber-400" size={20} />
            </div>
            <div>
              <p className="font-black text-sm uppercase">Dokumentasi Perbaikan</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Minimal 1 foto perbaikan</p>
            </div>
          </div>
          
          <label className="relative group cursor-pointer block">
            <input
              type="file" 
              multiple 
              accept="image/jpeg, image/png, image/webp, image/jpg" 
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-amber-400 transition-all">
              <ImageIcon className="text-amber-400 mb-3" size={40} />
              <p className="text-xs font-black uppercase tracking-widest text-white">
                {repairPhotos.length > 0 ? `${repairPhotos.length} Foto Dipilih` : 'Ambil Foto Perbaikan'}
              </p>
            </div>
          </label>

          {/* PREVIEW LIST */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">
            {repairPreviews.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden relative border border-white/10 group">
                <img src={src} className="w-full h-full object-cover" alt="repair preview" />
                <button 
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] ${
            loading 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Mengirim Data...
            </>
          ) : (
            <>
              Finalize & Complete Repair
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}