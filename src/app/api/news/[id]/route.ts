import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

// 获取单个新闻
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const news = await db.news.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!news) {
      return NextResponse.json(
        { error: '新闻不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('获取新闻失败:', error)
    return NextResponse.json(
      { error: '获取新闻失败' },
      { status: 500 }
    )
  }
}

// 更新新闻
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    const body = await request.json()
    const { title, content, summary, image, isPinned } = body
    const currentUserId = getCurrentUserId(request)

    // 构建更新数据，只有在有有效用户ID时才包含updatedBy
    const updateData: any = {
      title,
      content,
      summary,
      image,
      isPinned: isPinned !== undefined ? isPinned : false
    }
    
    if (currentUserId) {
      updateData.updatedBy = currentUserId
    }

    const news = await db.news.update({
      where: { id: parseInt(params.id) },
      data: updateData
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('更新新闻失败:', error)
    return NextResponse.json(
      { error: '更新新闻失败' },
      { status: 500 }
    )
  }
}

// 删除新闻
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    await db.news.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: '新闻删除成功' })
  } catch (error) {
    console.error('删除新闻失败:', error)
    return NextResponse.json(
      { error: '删除新闻失败' },
      { status: 500 }
    )
  }
}