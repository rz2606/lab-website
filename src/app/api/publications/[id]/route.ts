import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

// 获取单个发表成果
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const publication = await db.publication.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!publication) {
      return NextResponse.json(
        { error: '发表成果不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(publication)
  } catch (error) {
    console.error('获取发表成果失败:', error)
    return NextResponse.json(
      { error: '获取发表成果失败' },
      { status: 500 }
    )
  }
}

// 更新发表成果
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    const body = await request.json()
    const { title, authors, journal, year, type, content } = body
    const currentUserId = getCurrentUserId(request)

    const publication = await db.publication.update({
      where: { id: parseInt(params.id) },
      data: {
        title,
        authors,
        journal,
        year: year ? parseInt(year) : undefined,
        type,
        content,
        updatedBy: currentUserId
      }
    })

    return NextResponse.json(publication)
  } catch (error) {
    console.error('更新发表成果失败:', error)
    return NextResponse.json(
      { error: '更新发表成果失败' },
      { status: 500 }
    )
  }
}

// 删除发表成果
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    await db.publication.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: '发表成果删除成功' })
  } catch (error) {
    console.error('删除发表成果失败:', error)
    return NextResponse.json(
      { error: '删除发表成果失败' },
      { status: 500 }
    )
  }
}