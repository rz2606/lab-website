import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth-middleware'

// 获取所有毕业生
export async function GET() {
  try {
    const graduates = await db.graduate.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(graduates)
  } catch (error) {
    console.error('获取毕业生列表失败:', error)
    return NextResponse.json(
      { error: '获取毕业生列表失败' },
      { status: 500 }
    )
  }
}

// 创建新毕业生
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, position, email, company } = body
    const currentUserId = getCurrentUserId(request)

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: '姓名为必填项' },
        { status: 400 }
      )
    }

    const graduate = await db.graduate.create({
      data: {
        name,
        position,
        email,
        company,
        createdBy: currentUserId,
        updatedBy: currentUserId
      }
    })

    return NextResponse.json(graduate, { status: 201 })
  } catch (error) {
    console.error('创建毕业生失败:', error)
    return NextResponse.json(
      { error: '创建毕业生失败' },
      { status: 500 }
    )
  }
}