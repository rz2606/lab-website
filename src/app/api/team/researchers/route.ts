import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth-middleware'

// 获取所有研究人员
export async function GET() {
  try {
    const researchers = await db.researcher.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(researchers)
  } catch (error) {
    console.error('获取研究人员列表失败:', error)
    return NextResponse.json(
      { error: '获取研究人员列表失败' },
      { status: 500 }
    )
  }
}

// 创建新研究人员
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, photo, email, direction, type } = body
    const currentUserId = getCurrentUserId(request)

    // 验证必填字段
    if (!name || !email) {
      return NextResponse.json(
        { error: '姓名和邮箱为必填项' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingResearcher = await db.researcher.findUnique({
      where: { email }
    })

    if (existingResearcher) {
      return NextResponse.json(
        { error: '邮箱已存在' },
        { status: 400 }
      )
    }

    const researcher = await db.researcher.create({
      data: {
        name,
        photo,
        email,
        direction,
        type: type || 'researcher',
        createdBy: currentUserId,
        updatedBy: currentUserId
      }
    })

    return NextResponse.json(researcher, { status: 201 })
  } catch (error) {
    console.error('创建研究人员失败:', error)
    return NextResponse.json(
      { error: '创建研究人员失败' },
      { status: 500 }
    )
  }
}