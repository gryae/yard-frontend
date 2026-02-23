'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  CheckCircle2, 
  Camera, 
  Image as ImageIcon, 
  Printer, 
  User, 
  Key, 
  ShieldCheck, 
  Loader2,
  FileCheck
} from 'lucide-react'

export default function ReceivingPage() {
  const { goodsId } = useParams()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams?.get('token') ?? ""

  const [token] = useState(tokenFromUrl)
  const [verificationCode, setVerificationCode] = useState('')
  const [verified, setVerified] = useState(false)
  const [receiverName, setReceiverName] = useState('')
  const [loading, setLoading] = useState(false)

  const [photos, setPhotos] = useState({
    front: null as File | null,
    back: null as File | null,
    right: null as File | null,
    left: null as File | null,
    bast: null as File | null,
  })

  // Helper untuk preview gambar
  const [previews, setPreviews] = useState<Record<string, string>>({})

  const handleVerify = async () => {
    try {
      setLoading(true)
      await axios.post(`/delivery/${goodsId}/verify`, {
        token,
        verificationCode,
      })
      setVerified(true)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kode verifikasi salah. Silakan cek kembali.')
    } finally {
      setLoading(false)
    }
  }

  const uploadPhotos = async () => {
    const formData = new FormData()
    const requiredKeys = Object.keys(photos)
    
    for (const key of requiredKeys) {
      const file = (photos as any)[key]
      if (!file) throw new Error(`Foto ${key} belum diunggah`)
      formData.append('files', file)
    }

    formData.append('process', 'RECEIVING')
    await axios.post(`/photos/${goodsId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  const handleComplete = async () => {
    if (!receiverName) return alert('Silakan masukkan nama penerima')
    
    try {
      setLoading(true)
      await uploadPhotos()
      await axios.post(`/delivery/${goodsId}/receive`, { receiverName })
      alert('Selamat! Unit telah berhasil diterima.')
      window.location.reload()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses data. Pastikan semua foto sudah terisi.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setPhotos(prev => ({ ...prev, [key]: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [key]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-blue-700 text-white py-8 px-6 rounded-b-[40px] shadow-lg mb-8 text-center">
        <h1 className="text-2xl font-black tracking-tight mb-2">Konfirmasi Penerimaan</h1>
        <p className="text-blue-100 text-sm">Sistem Serah Terima Unit Kendaraan</p>
      </div>

      <div className="max-w-md mx-auto px-6">
        {/* Stepper Visual */}
        <div className="flex items-center justify-between mb-8 px-4">
          <StepItem active={true} done={verified} label="Verifikasi" />
          <div className={`flex-1 h-[2px] mx-2 ${verified ? 'bg-green-500' : 'bg-gray-300'}`} />
          <StepItem active={verified} done={false} label="Data Unit" />
        </div>

        {!verified ? (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <ShieldCheck className="text-blue-600" size={48} />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Delivery Token
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    value={token}
                    disabled
                    className="w-full bg-gray-50 border-none px-10 py-3 rounded-xl font-mono text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Kode Keamanan
                </label>
                <input
                  type="number"
                  placeholder="6 digit kode dari pengirim"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full border-2 border-gray-100 focus:border-blue-600 focus:ring-0 px-4 py-4 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] transition-all"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={loading || !verificationCode}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Verifikasi Sekarang'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Step 2: Upload Data */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Informasi Penerima
              </h2>
              <input
                placeholder="Masukkan nama lengkap sesuai KTP"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full border-2 border-gray-100 focus:border-blue-600 px-4 py-3 rounded-xl transition-all"
              />
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Camera size={20} className="text-blue-600" /> Dokumentasi Unit
                </h2>
                <span className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-md font-bold uppercase">Wajib</span>
              </div>

              <div className="space-y-6">
                <UploadField 
                  label="Tampak Depan" 
                  preview={previews.front}
                  onChange={(file) => handleFileChange('front', file)} 
                />
                <UploadField 
                  label="Tampak Belakang" 
                  preview={previews.back}
                  onChange={(file) => handleFileChange('back', file)} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <UploadField 
                    label="Samping Kanan" 
                    preview={previews.right}
                    onChange={(file) => handleFileChange('right', file)} 
                  />
                  <UploadField 
                    label="Samping Kiri" 
                    preview={previews.left}
                    onChange={(file) => handleFileChange('left', file)} 
                  />
                </div>
                
                <hr className="border-dashed border-gray-200 my-4" />

                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                   <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                    <Printer size={16} /> Dokumen BAST
                   </h3>
                   <p className="text-xs text-orange-700 mb-4 leading-relaxed">
                     Silakan cetak dokumen BAST, tanda tangani, lalu foto dan unggah di bawah ini.
                   </p>
                   <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/delivery/bast/${goodsId}/print?token=${token}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-white border border-orange-200 text-orange-600 font-bold py-2 rounded-xl text-sm hover:bg-orange-100 transition-colors"
                  >
                    Cetak Dokumen BAST
                  </a>
                </div>

                <UploadField 
                  label="Foto BAST Tertandatangan" 
                  preview={previews.bast}
                  onChange={(file) => handleFileChange('bast', file)} 
                />
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <FileCheck />
                  Selesaikan Penerimaan
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ===============================
// UI HELPERS
// ===============================

function StepItem({ active, done, label }: { active: boolean, done: boolean, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
        done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-400'
      }`}>
        {done ? <CheckCircle2 size={20} /> : <span className="text-sm font-bold">{active ? '●' : ''}</span>}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active || done ? 'text-gray-800' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}

interface UploadFieldProps {
  label: string
  preview?: string
  onChange: (file: File | null) => void
}

function UploadField({ label, preview, onChange }: UploadFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold text-gray-500 uppercase ml-1">
        {label}
      </label>

      {preview ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-blue-100 aspect-video bg-gray-50">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-full text-xs font-bold shadow-xl">
              Ganti Foto
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => onChange(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-600 py-6 rounded-2xl cursor-pointer border-2 border-dashed border-blue-200 hover:bg-blue-100 transition-all">
            <Camera size={24} />
            <span className="text-[10px] font-bold uppercase">Kamera</span>
            <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => onChange(e.target.files?.[0] || null)} />
          </label>

          <label className="flex flex-col items-center justify-center gap-2 bg-gray-50 text-gray-500 py-6 rounded-2xl cursor-pointer border-2 border-dashed border-gray-200 hover:bg-gray-100 transition-all">
            <ImageIcon size={24} />
            <span className="text-[10px] font-bold uppercase">Galeri</span>
            <input type="file" accept="image/*" hidden onChange={(e) => onChange(e.target.files?.[0] || null)} />
          </label>
        </div>
      )}
    </div>
  )
}