import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface AdminUser {
  username: string
  email: string
  password: string
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const adminUser: AdminUser = await request.json()
    
    // 验证必填字段
    if (!adminUser.username || !adminUser.email || !adminUser.password || !adminUser.name) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(adminUser.email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }
    
    // 验证密码长度
    if (adminUser.password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }
    
    // 检查用户名是否已存在
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: adminUser.username }
    })
    
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }
    
    // 检查邮箱是否已存在
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: adminUser.email }
    })
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: '邮箱已被使用' },
        { status: 400 }
      )
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(adminUser.password, 12)
    
    // 创建管理员用户
    const newAdmin = await prisma.user.create({
      data: {
        username: adminUser.username,
        email: adminUser.email,
        password: hashedPassword,
        name: adminUser.name,
        roleType: 'admin',
        isActive: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        roleType: true,
        isActive: true,
        createdAt: true
      }
    })
    
    return NextResponse.json(
      { 
        success: true, 
        message: '管理员账户创建成功',
        admin: newAdmin
      },
      { status: 201 }
    )
    
  } catch (error: any) {
    console.error('创建管理员账户失败:', error)
    
    let errorMessage = '创建管理员账户失败'
    
    if (error.code === 'P2002') {
      // Prisma唯一约束错误
      if (error.meta?.target?.includes('username')) {
        errorMessage = '用户名已存在'
      } else if (error.meta?.target?.includes('email')) {
        errorMessage = '邮箱已被使用'
      } else {
        errorMessage = '数据冲突，请检查用户名和邮箱'
      }
    } else if (error.code === 'P2025') {
      errorMessage = '数据库表不存在，请先初始化数据库'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}