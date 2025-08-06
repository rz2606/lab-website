import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

export async function GET() {
  try {
    const news = await db.news.findMany({
      orderBy: [
        { isPinned: 'desc' }, // 置顶新闻排在前面
        { createdAt: 'desc' }  // 然后按创建时间倒序
      ]
    })
    return NextResponse.json(news)
  } catch (error) {
    console.error('获取新闻失败:', error)
    return NextResponse.json(
      { error: '获取新闻失败' },
      { status: 500 }
    )
  }
}

// 创建新新闻
export async function POST(request: NextRequest) {
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    const body = await request.json()
    const { title, content, summary, image, isPinned } = body
    const currentUserId = getCurrentUserId(request)

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容为必填项' },
        { status: 400 }
      )
    }

    // 构建创建数据，只有在有有效用户ID时才包含createdBy和updatedBy
    const createData: any = {
      title,
      content,
      summary,
      image,
      isPinned: isPinned || false
    }
    
    if (currentUserId) {
      createData.createdBy = currentUserId
      createData.updatedBy = currentUserId
    }

    const news = await db.news.create({
      data: createData
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error('创建新闻失败:', error)
    return NextResponse.json(
      { error: '创建新闻失败' },
      { status: 500 }
    )
  }
}