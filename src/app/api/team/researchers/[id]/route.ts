import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

// 获取单个研究人员
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const researcher = await db.researcher.findUnique({
      where: { id: parseInt(id) }
    })

    if (!researcher) {
      return NextResponse.json(
        { error: '研究人员不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(researcher)
  } catch (error) {
    console.error('获取研究人员失败:', error)
    return NextResponse.json(
      { error: '获取研究人员失败' },
      { status: 500 }
    )
  }
}

// 更新研究人员
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    const body = await request.json()
    const { name, photo, email, direction, type } = body
    const currentUserId = getCurrentUserId(request)

    const researcher = await db.researcher.update({
      where: { id: parseInt(id) },
      data: {
        name,
        photo,
        email,
        direction,
        type,
        updatedBy: currentUserId
      }
    })

    return NextResponse.json(researcher)
  } catch (error) {
    console.error('更新研究人员失败:', error)
    return NextResponse.json(
      { error: '更新研究人员失败' },
      { status: 500 }
    )
  }
}

// 删除研究人员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.researcher.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: '研究人员删除成功' })
  } catch (error) {
    console.error('删除研究人员失败:', error)
    return NextResponse.json(
      { error: '删除研究人员失败' },
      { status: 500 }
    )
  }
}