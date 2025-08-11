import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

export async function GET() {
  try {
    const tools = await db.tool.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(tools)
  } catch (error) {
    console.error('获取开发工具失败:', error)
    return NextResponse.json(
      { error: '获取开发工具失败' },
      { status: 500 }
    )
  }
}

// 创建新开发工具
export async function POST(request: NextRequest) {
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    const body = await request.json()
    const { name, description, url, category, image, reference, tags } = body
    const currentUserId = getCurrentUserId(request)

    // 验证必填字段
    if (!name || !description) {
      return NextResponse.json(
        { error: '名称和描述为必填项' },
        { status: 400 }
      )
    }

    const tool = await db.tool.create({
      data: {
        name,
        description,
        url,
        category,
        image,
        reference,
        tags,
        createdBy: currentUserId,
        updatedBy: currentUserId
      }
    })

    return NextResponse.json(tool, { status: 201 })
  } catch (error) {
    console.error('创建开发工具失败:', error)
    return NextResponse.json(
      { error: '创建开发工具失败' },
      { status: 500 }
    )
  }
}