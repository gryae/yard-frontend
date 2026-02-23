'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import axios from '@/lib/axios'

export default function ConditionPage() {

  const router = useRouter()
  const params = useParams()
  const goodsId = params.id as string

  const [loading, setLoading] = useState(false)

  const [checklist, setChecklist] = useState({
    body: true,
    kaca: true,
    lampu: true,
    ban: true,
    interior: true,
  })

  const handleChange = (key: string, value: boolean) => {
    setChecklist(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async () => {
    try {

      setLoading(true)

      const res = await axios.post(
        `/goods/${goodsId}/condition-check`,
        { checklist }
      )

      const nextStatus = res.data.nextStatus

      if (nextStatus === 'REPAIR') {
        router.push(`/repair/${goodsId}`)
      }

      if (nextStatus === 'PDI') {
        router.push(`/pdi/${goodsId}`)
      }

    } catch (err: any) {
      alert(err.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <h1 className="text-xl font-bold mb-6">Condition Check</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        {Object.keys(checklist).map((key) => (
          <div key={key} className="flex justify-between items-center">
            <span className="capitalize">{key}</span>

            <select
              className="border rounded px-2 py-1"
              value={checklist[key as keyof typeof checklist] ? 'YES' : 'NO'}
              onChange={(e) =>
                handleChange(key, e.target.value === 'YES')
              }
            >
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>

      </div>
    </MainLayout>
  )
}
