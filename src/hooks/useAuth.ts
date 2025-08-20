import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAdmin, isAuthenticated, clearAuth } from '@/lib/auth'
import { User } from '@/types/admin'

export const useAuth = () => {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false)

  // 检查认证状态
  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    try {
      const authenticated = isAuthenticated()
      const admin = isAdmin()
      const user = getCurrentUser()

      setIsAuthenticatedUser(authenticated)
      setIsAdminUser(admin)
      setCurrentUser(user)

      // 如果未认证或不是管理员，重定向到登录页
      if (!authenticated || !admin) {
        clearAuth()
        router.push('/login')
        return false
      }

      return true
    } catch (error) {
      console.error('认证检查失败:', error)
      clearAuth()
      router.push('/login')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // 登出
  const logout = useCallback(() => {
    clearAuth()
    setCurrentUser(null)
    setIsAdminUser(false)
    setIsAuthenticatedUser(false)
    router.push('/login')
  }, [router])

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    currentUser,
    isLoading,
    isAdminUser,
    isAuthenticatedUser,
    checkAuth,
    logout
  }
}