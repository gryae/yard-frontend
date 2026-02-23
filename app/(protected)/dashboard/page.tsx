'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import QRCode from 'qrcode'
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  X, 
  Clock, 
  MapPin, 
  Package, 
  History, 
  Image as ImageIcon,
  FileText,
  AlertCircle
} from 'lucide-react'

export default function DashboardPage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  const [data, setData] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<any>(null)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!detail?.qrImage) {
      setGeneratedQR(null)
      return
    }
    QRCode.toDataURL(detail.qrImage)
      .then(url => setGeneratedQR(url))
      .catch(err => {
        console.error(err)
        setGeneratedQR(null)
      })
  }, [detail])

  const fetchData = async () => {
    const res = await axios.get('/goods/dashboard/full')
    setData(res.data)
    //console.log(res.data)
  }

  const openDetail = async (id: string) => {
    setSelectedId(id)
    const res = await axios.get(`/goods/${id}/detail`)
    setDetail(res.data)
  }

  const getImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${BACKEND_URL}${url}`
  }

  const downloadPDF = async () => {
    const res = await axios.get(`/goods/${detail.id}/pdi/print`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `PDI-${detail.id}.pdf`)
    document.body.appendChild(link)
    link.click()
  }


  const exportFullBackup = async () => {
    const res = await axios.get('/goods/export/full-backup', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'YARD-FULL-BACKUP.zip')
    document.body.appendChild(link)
    link.click()
  }

  const handleImportMaster = async (file: File) => {
  try {
    setImporting(true)
    setImportResult(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await axios.post('/master/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    setImportResult(res.data)
    fetchData() // refresh dashboard
  } catch (err: any) {
    alert(err.response?.data?.message || 'Import failed')
  } finally {
    setImporting(false)
  }
}

  const handlePrintQR = (qrImage: string, engine: string, chassis: string, incomingDate:string) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const formattedDate = new Date (incomingDate).toLocaleDateString()
    const html = `<html><head><title>Print QR</title><style>body { text-align: center; font-family: Arial; padding: 30px; } img { width: 220px; margin-bottom: 16px; } .text { font-size: 14px; margin: 4px 0; font-weight: bold; }</style></head><body><img id="qrImg" src="${qrImage}" /><div class="text">Engine: ${engine}</div><div class="text">Chassis: ${chassis}</div><div class="text">Incoming: ${formattedDate}</div><script>const img = document.getElementById('qrImg'); img.onload = function() { window.focus(); window.print(); window.close(); }</script></body></html>`
    printWindow.document.open(); printWindow.document.write(html); printWindow.document.close()
  }

//   const printRepair = async (goodsId: string) => {
//   try {
//     const res = await axios.get(`/goods/${goodsId}/repair/print`,
//       { responseType: 'blob' }
//     )

//     const url = window.URL.createObjectURL(new Blob([res.data]))
//     window.open(url, '_blank')

//   } catch (err: any) {
//     alert(err.response?.data?.message || 'Error print Repair')
//   }
// }


  const printRepair = async () => {
    const res = await axios.get(`/goods/${detail.id}/repair/print`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Repair-${detail.id}.pdf`)
    document.body.appendChild(link)
    link.click()
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 animate-pulse font-medium">Synchronizing Yard Data...</p>
    </div>
  )

  const summary = data.summary
  const filteredGoods = data.goods.filter((g: any) => {
    const matchStatus = filterStatus === 'ALL' || g.currentStatus === filterStatus
    const matchSearch = g.engineNumber?.toLowerCase().includes(search.toLowerCase()) || g.chassisNumber?.toLowerCase().includes(search.toLowerCase()) || g.blNumber?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
      INCOMING: 'bg-amber-100 text-amber-700 border-amber-200',
      REPAIR: 'bg-red-100 text-red-700 border-red-200',
      PDI: 'bg-purple-100 text-purple-700 border-purple-200',
      READY: 'bg-green-100 text-green-700 border-green-200',
      DELIVERED: 'bg-blue-100 text-blue-700 border-blue-200',
      COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Yard Monitoring</h1>
          <p className="text-gray-500 text-sm">Real-time inventory and logistics tracking</p>
        </div>
        {importResult && (
  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm">
    ✅ Imported: {importResult.imported}  
    ⚠ Duplicate: {importResult.duplicate}  
    ❌ Failed: {importResult.failed}
  </div>
)}
        {/* <button
          onClick={exportFullBackup}
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-red-100/50"
        >
          <Download size={18} />
          Export Backup
        </button> */}
        <div className="flex gap-3">
  
  {/* IMPORT BUTTON */}
  <label className="inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm cursor-pointer">
    <Download size={18} />
    {importing ? 'Importing...' : 'Import Master'}

    <input
      type="file"
      accept=".xlsx, .xls"
      className="hidden"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          handleImportMaster(e.target.files[0])
        }
      }}
    />
  </label>

  {/* EXPORT BUTTON */}
  <button
    onClick={exportFullBackup}
    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
  >
    <Download size={18} />
    Export Data
  </button>

</div>
      </div>

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inventory', val: summary.total, color: 'text-gray-900' },
          { label: 'Incoming', val: summary.INCOMING, color: 'text-amber-600' },
          { label: 'Under Repair', val: summary.REPAIR, color: 'text-red-600' },
          { label: 'Ready Stock', val: summary.READY, color: 'text-green-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`text-3xl font-black ${item.color}`}>{item.val}</p>
          </div>
        ))}
        
        {/* Special Overdue Card */}
        <div className={`p-5 rounded-2xl border-2 transition-all ${summary.BAST_OVERDUE > 0 ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">BAST Overdue</p>
              <p className={`text-3xl font-black ${summary.BAST_OVERDUE > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {summary.BAST_OVERDUE}
              </p>
            </div>
            {summary.BAST_OVERDUE > 0 && <AlertCircle className="text-red-500" size={24} />}
          </div>
        </div>
      </div>

      {/* PROGRESS TRACKER */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Master Integration Progress</h2>
            <p className="text-sm text-gray-500">Unit entry ratio vs master data</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600">
              {Math.round(data.masterTotal === 0 ? 0 : (data.everIncoming / data.masterTotal) * 100)}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(data.everIncoming / data.masterTotal) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600"><strong>{data.everIncoming}</strong> In Yard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-sm text-gray-600"><strong>{data.neverIncoming}</strong> Pending Entry</span>
          </div>
          <div className="flex items-center gap-3 md:justify-end">
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">Total Master: {data.masterTotal}</span>
          </div>
        </div>
      </div>

      {/* TABLE FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Search engine/chassis number or BL number..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="pl-9 pr-8 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none font-medium text-gray-700"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              {['INCOMING', 'REPAIR', 'PDI', 'READY', 'DELIVERED', 'RECEIVED', 'COMPLETED'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Unit Details</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">BL Number</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Yard Position</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Aging</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredGoods.map((g: any) => (
                <tr 
                  key={g.id} 
                  className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                  onClick={() => openDetail(g.id)}
                >
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{g.engineNumber}</div>

                    <div className="text-xs text-gray-400 font-mono">{g.chassisNumber}</div>
                  </td>

                  <td className="p-4">
                                      <div className="font-bold text-gray-800">{g.blNumber}</div>                  </td>                    
                  <td className="p-4">
                    <StatusBadge status={g.currentStatus} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium text-sm">
                      <MapPin size={14} className="text-blue-500" />
                      Zone {g.zone} • R{g.row} L{g.lane}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center gap-1.5 text-sm font-semibold ${g.daysInYard > 30 ? 'text-red-500' : 'text-gray-600'}`}>
                      <Clock size={14} />
                      {g.daysInYard} Days
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detail && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 leading-none mb-1">{detail.engineNumber}</h2>
                  <p className="text-xs text-gray-500 font-mono tracking-tighter">{detail.chassisNumber}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Quick Info & Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Current Status</p>
                      <StatusBadge status={detail.currentStatus} />
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Location</p>
                      <div className="text-sm font-bold text-gray-800">Zone {detail.location?.zone} — Row {detail.location?.row} Lane {detail.location?.lane}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL}/goods/${detail.id}/incoming-pdf`}
                      target="_blank"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      <FileText size={18} /> Incoming Form
                    </a>
                    <button 
                      onClick={downloadPDF}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      <Download size={18} /> PDI PDF

                    </button>
                      <button
    onClick={() => printRepair()}
    className="bg-orange-600 text-white px-4 py-2 rounded"
  >
    Print Repair
  </button>


                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-dashed border-gray-300">
                  {generatedQR ? (
                    <>
                      <img src={generatedQR} className="w-32 h-32 object-contain mix-blend-multiply mb-3" />
                      <button 
                        onClick={() => handlePrintQR(generatedQR, detail.engineNumber, detail.chassisNumber, detail.incomingDate)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg font-bold text-xs hover:bg-gray-100 transition-all shadow-sm"
                      >
                        <Printer size={14} /> Print Label
                      </button>
                    </>
                  ) : (
                    <div className="text-gray-400 text-xs italic">Generating QR...</div>
                  )}
                </div>
              </div>

              {/* Logs Section */}
              <div>
                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                  <History size={18} className="text-blue-500" />
                  <h3 className="font-bold text-gray-800">Unit Activity History</h3>
                </div>
                <div className="space-y-4">
                  {detail.logs?.map((log: any) => (
                    <div key={log.id} className="relative pl-6 border-l-2 border-gray-100 pb-2">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-100 border-2 border-blue-500" />
                      <div className="text-sm font-bold text-gray-800">{log.action}</div>
                      <div className="text-xs text-gray-500 mb-1">{log.fromStatus || 'START'} → {log.toStatus || 'END'}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-50 w-fit px-2 py-0.5 rounded">
                        <Clock size={10} /> {new Date(log.createdAt).toLocaleString()} • {log.user?.name || 'System'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos Section */}
              <div>
                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                  <ImageIcon size={18} className="text-blue-500" />
                  <h3 className="font-bold text-gray-800">Inspection Photos</h3>
                </div>
                {detail.photos && Object.keys(detail.photos).map((process) => (
                  <div key={process} className="mb-6 last:mb-0">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                      <div className="h-px bg-gray-100 flex-1" />
                      {process}
                      <div className="h-px bg-gray-100 flex-1" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {detail.photos[process].map((p: any) => (
                        <div key={p.id} className="relative group aspect-video overflow-hidden rounded-xl shadow-sm border border-gray-200">
                          <img 
                            src={getImageUrl(p.url)} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                            onClick={() => setZoomImage(getImageUrl(p.url))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM MODAL (HIGHEST Z-INDEX) */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] cursor-zoom-out p-4"
          onClick={() => setZoomImage(null)}
        >
          <img src={zoomImage} className="max-h-full max-w-full rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" />
        </div>
      )}
    </div>
  )
}