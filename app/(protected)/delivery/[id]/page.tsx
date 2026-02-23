'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { 
  FileText, 
  Truck, 
  User, 
  Phone, 
  Calendar, 
  Printer, 
  ChevronLeft, 
  Package, 
  Hash, 
  Unlock, 
  MapPin, 
  Clock,
  ShieldAlert,
  CheckCircle2,
  Loader2
} from 'lucide-react'

export default function DeliveryDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [delivery, setDelivery] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
  }, [])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/delivery/${id}`)
      setDelivery(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const unlockToken = async (goodsId: string) => {
    if(!confirm('Unlock token untuk unit ini?')) return
    try {
      await axios.post(`/delivery/${goodsId}/unlock-token`)
      alert('Token unlocked')
      fetchDetail()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal unlock token')
    }
  }


  

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Detail...</p>
    </div>
  )

  if (!delivery) return <div className="p-10 text-center uppercase font-black">Delivery Not Found</div>


  const handleRollback = async (goodsId:string) => {
  if (!confirm('Cancel this delivery and return unit to READY?')) return;

  try {
    await axios.post(`/goods/${goodsId}/rollback-delivery`);
    alert('Delivery cancelled');
    router.push('/delivery');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error');
  }
};


  const handleComplete = async (deliveryId: string) => {
  if (!confirm('Mark this unit as COMPLETED?')) return;

  try {
    await axios.patch(`/delivery/${deliveryId}/complete`);
    alert('Unit marked as completed');
    fetchDetail(); // refresh data
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error completing unit');
  }
};
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* TOP NAVIGATION */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
              Detail Surat Jalan
            </h1>
            <p className="text-[10px] font-bold text-indigo-600 tracking-widest">{delivery.suratJalanNumber}</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto space-y-6 mt-4">
        
        {/* MAIN INFO CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Truck size={14} /> Logistics Information
              </div>
              
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><User size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Driver Name</p>
                    <p className="text-sm font-bold text-slate-700">{delivery.driverName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Phone size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Phone Number</p>
                    <p className="text-sm font-bold text-slate-700">{delivery.driverPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><FileText size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Jenis Pengiriman</p>
                    <p className="text-sm font-bold text-slate-700">{delivery.jenisPengiriman}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Calendar size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Shipment Date</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(delivery.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/delivery/${delivery.id}/print`}
                target="_blank"
                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                <Printer size={18} /> Print Surat Jalan
              </a>
            </div>
          </div>
        </div>

        {/* GOODS SECTION HEADER */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-[2px] flex-1 bg-slate-200" />
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <Package size={16} /> Unit List ({delivery.items.length})
          </h2>
          <div className="h-[2px] flex-1 bg-slate-200" />
        </div>

        {/* GOODS ITEMS */}
        <div className="space-y-4">
          {delivery.items.map((item: any) => {
            const goods = item.goods
            const isDelivered = goods.currentStatus === 'DELIVERED'
            const isReceived = goods.currentStatus === 'RECEIVED'

            return (
              
              <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    
                    {/* Unit Info */}
                    <div className="space-y-4 min-w-[250px]">
                      <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                          {goods.unit.brand}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">Engine</span>
                          <p className="text-xs font-mono font-bold text-slate-600">{goods.unit.engineNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">Chassis</span>
                          <p className="text-xs font-mono font-bold text-slate-400">{goods.unit.chassisNumber}</p>
                        </div>
                      </div>
                      

                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        isDelivered ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDelivered ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                        {goods.currentStatus}
                      </div>
                    </div>

                    {/* Technical Specs Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                      <SpecItem icon={<Hash size={12}/>} label="No Pol" value={item.noPol} />
                      <SpecItem icon={<MapPin size={12}/>} label="Tujuan" value={item.tujuanPengiriman} />
                      <SpecItem icon={<ShieldAlert size={12}/>} label="Token" value={goods.deliveryToken} isHighlight />
                      <SpecItem icon={<ShieldAlert size={12}/>} label="Code" value={goods.verificationCode} isHighlight />
                      <SpecItem icon={<Clock size={12}/>} label="Expire" value={goods.tokenExpiredAt ? new Date(goods.tokenExpiredAt).toLocaleDateString() : '-'} />
                      <SpecItem icon={<CheckCircle2 size={12}/>} label="Attempts" value={`${goods.attemptCount} Times`} />
                      <SpecItem icon={<ShieldAlert size={12}/>} label="Locked" value={goods.isLocked ? 'YES' : 'NO'} isWarning={goods.isLocked} />
                    </div>
                    
                  </div>
                  

                  {/* BOTTOM ACTIONS PER ITEM */}
                  {( (isDelivered && goods.deliveryToken && !goods.isLocked) || goods.isLocked ) && (
                    <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap gap-3">
                      {isDelivered && goods.deliveryToken && !goods.isLocked && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/delivery/bast/${goods.id}/print?token=${goods.deliveryToken}`}
                          target="_blank"
                          className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                        >
                          <Printer size={14} /> Print BAST
                        </a>
                        
                      )}
          <button
  onClick={() => handleRollback(goods.id)}
  className="bg-orange-600 text-white px-4 py-2 rounded"
>
  Cancel Delivery
</button>
{isReceived && (
  <button
    onClick={() => handleComplete(delivery.id)}
    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
  >
    <CheckCircle2 size={14} /> Complete
  </button>
)}
                      {goods.isLocked && (
                        <button
                          onClick={() => unlockToken(goods.id)}
                          className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                        >
                          <Unlock size={14} /> Unlock Token
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

        </div>
        
      </div>
      
    </div>
  )
}

function SpecItem({ label, value, icon, isHighlight, isWarning }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={`text-xs font-bold truncate ${
        isHighlight ? 'text-indigo-600 font-mono' : 
        isWarning ? 'text-rose-500' : 
        'text-slate-700'
      }`}>
        {value || '-'}
      </p>
    </div>
  )
}