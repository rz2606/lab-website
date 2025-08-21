import { useState, useCallback } from 'react'
import { getToken } from '@/lib/auth'

interface PI {
  id: number
  name: string
  photo?: string
  title?: string
  email?: string
  experience?: string
  positions?: string
  awards?: string
  papers?: string
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

interface Researcher {
  id: number
  name: string
  photo?: string
  email?: string
  direction?: string
  type: string
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

interface Graduate {
  id: number
  serialNumber?: string
  name: string
  enrollmentDate?: string
  graduationDate?: string
  advisor?: string
  degree?: string
  discipline?: string
  thesisTitle?: string
  remarks?: string
  hasPaper?: boolean
  position?: string
  email?: string
  company?: string
  graduationYear?: number
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

interface TeamData {
  pi: PI | null
  researchers: Researcher[]
  graduates: Graduate[]
}

export const useTeamData = () => {
  const [data, setData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = getToken()
      const response = await fetch('/api/team', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('获取团队数据失败')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
      console.error('获取团队数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    fetchData,
    refreshData
  }
}