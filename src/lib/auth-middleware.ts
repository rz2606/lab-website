import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// JWT payload 接口
interface JWTPayload {
  userId: number
  username: string
  roleType: string
  iat?: number
  exp?: number
}

// 验证JWT token
function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'default-secret'
    ) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token验证失败:', error)
    return null
  }
}

// 从请求头获取token
function getTokenFromRequest(request: NextRequest): string | null {
  // 从Authorization header获取token
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // 从cookie获取token（如果有的话）
  const cookieToken = request.cookies.get('token')?.value
  if (cookieToken) {
    return cookieToken
  }
  
  return null
}

// 获取当前用户ID
export function getCurrentUserId(request: NextRequest): number | null {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    return payload?.userId || null
  } catch (error) {
    console.error('获取用户ID失败:', error)
    return null
  }
}

// 权限验证中间件
export function withAuth(handler: Function, requiredRole?: string) {
  return async (request: NextRequest, context?: any) => {
    try {
      const token = getTokenFromRequest(request)
      
      if (!token) {
        return NextResponse.json(
          { error: '未提供认证token' },
          { status: 401 }
        )
      }
      
      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json(
          { error: 'token无效或已过期' },
          { status: 401 }
        )
      }
      
      // 检查角色权限
      if (requiredRole) {
        if (payload.roleType !== 'admin' && payload.roleType !== requiredRole) {
          return NextResponse.json(
            { error: '权限不足' },
            { status: 403 }
          )
        }
      }
      
      // 将用户信息添加到请求中
      (request as any).user = payload
      
      // 调用原始处理函数
      return await handler(request, context)
    } catch (error) {
      console.error('权限验证失败:', error)
      return NextResponse.json(
        { error: '权限验证失败' },
        { status: 500 }
      )
    }
  }
}

// 仅管理员权限
export function withAdminAuth(handler: Function) {
  return withAuth(handler, 'admin')
}

// 检查用户是否为管理员
export function requireAdmin(request: NextRequest): NextResponse | null {
  const token = getTokenFromRequest(request)
  
  if (!token) {
    return NextResponse.json(
      { error: '未提供认证token' },
      { status: 401 }
    )
  }
  
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      { error: 'token无效或已过期' },
      { status: 401 }
    )
  }
  
  if (payload.roleType !== 'admin') {
    return NextResponse.json(
      { error: '权限不足，需要管理员权限' },
      { status: 403 }
    )
  }
  
  return null // 验证通过
}