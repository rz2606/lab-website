import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

// 获取所有用户（仅管理员）
export async function GET(request: NextRequest) {
  // 权限验证
  const authError = requireAdmin(request)
  if (authError) return authError
  
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        roleType: true,
        name: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  // 权限验证
  const authError = requireAdmin(request)
  if (authError) return authError
  
  try {
    const body = await request.json()
    const { username, email, password, roleType = 'user', name } = body
    const currentUserId = getCurrentUserId(request)

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '用户名、邮箱和密码为必填项' },
        { status: 400 }
      )
    }

    // 检查用户名和邮箱是否已存在
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名或邮箱已存在' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const user = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roleType,
        name
      },
      select: {
        id: true,
        username: true,
        email: true,
        roleType: true,
        name: true,
        avatar: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    )
  }
}