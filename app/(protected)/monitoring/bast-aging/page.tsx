'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import MainLayout from '@/components/layout/MainLayout'

export default function BASTAgingPage() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const res = await axios.get('/goods/monitoring/bast-aging')
    setData(res.data)
  }

  return (
    <MainLayout>

      <h1 className="text-2xl font-bold mb-6">
        Monitoring BAST Aging
      </h1>

      <div className="bg-white rounded-xl shadow p-6">

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">No Mesin</th>
              <th className="text-left p-2">No Rangka</th>
              <th className="text-left p-2">Receiver</th>
              <th className="text-left p-2">Tanggal Terima</th>
              <th className="text-left p-2">Aging (Hari)</th>
            </tr>
          </thead>

          <tbody>
            {data.map(item => (
              <tr
                key={item.id}
                className={`border-b ${
                  item.isOverdue ? 'bg-red-100' : ''
                }`}
              >
                <td className="p-2">{item.engineNumber}</td>
                <td className="p-2">{item.chassisNumber}</td>
                <td className="p-2">{item.receiverName}</td>
                <td className="p-2">
                  {new Date(item.receivedDate).toLocaleDateString()}
                </td>
                <td className={`p-2 font-semibold ${
                  item.isOverdue ? 'text-red-600' : ''
                }`}>
                  {item.aging}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </MainLayout>
  )
}
