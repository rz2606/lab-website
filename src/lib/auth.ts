// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  email: string
  roleType: string
  name?: string
  avatar?: string
}

// JWT payload 接口
export interface JWTPayload {
  userId: number
  username: string
  roleType: string
  iat?: number
  exp?: number
}

// 客户端JWT token验证（简化版）
export function verifyToken(token: string): JWTPayload | null {
  try {
    // 在客户端，我们只做基本的token格式检查和解析
    // 真正的验证在服务端进行
    if (!token || typeof token !== 'string') {
      return null
    }
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    // 解析payload部分
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as JWTPayload
    
    // 检查token是否过期
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null
    }
    
    return decoded
  } catch (error) {
    console.error('Token验证失败:', error)
    return null
  }
}

// 从localStorage获取用户信息
export function getCurrentUser(): UserInfo | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 从localStorage获取token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

// 检查用户是否已登录
export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  
  const payload = verifyToken(token)
  return payload !== null
}

// 检查用户是否为管理员
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.roleType === 'admin'
}

// 检查用户权限
export function hasPermission(requiredRole: string): boolean {
  const user = getCurrentUser()
  if (!user) return false
  
  // admin 拥有所有权限
  if (user.roleType === 'admin') return true
  
  // 检查特定角色权限
  return user.roleType === requiredRole
}

// 清除认证信息
export function clearAuth(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// 权限检查hook
export function useAuth() {
  const user = getCurrentUser()
  const token = getToken()
  const authenticated = isAuthenticated()
  const admin = isAdmin()
  
  return {
    user,
    token,
    authenticated,
    admin,
    hasPermission,
    clearAuth
  }
}