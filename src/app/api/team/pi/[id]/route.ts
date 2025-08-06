import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

// 获取单个PI
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const pi = await db.pI.findUnique({
      where: { id: parseInt(id) }
    })

    if (!pi) {
      return NextResponse.json(
        { error: 'PI不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(pi)
  } catch (error) {
    console.error('获取PI失败:', error)
    return NextResponse.json(
      { error: '获取PI失败' },
      { status: 500 }
    )
  }
}

// 更新PI
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
    const { name, photo, title, email, experience, positions, awards, papers } = body
    const currentUserId = getCurrentUserId(request)

    const pi = await db.pI.update({
      where: { id: parseInt(id) },
      data: {
        name,
        photo,
        title,
        email,
        experience,
        positions,
        awards,
        papers,
        updatedBy: currentUserId
      }
    })

    return NextResponse.json(pi)
  } catch (error) {
    console.error('更新PI失败:', error)
    return NextResponse.json(
      { error: '更新PI失败' },
      { status: 500 }
    )
  }
}

// 删除PI
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    await db.pI.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'PI删除成功' })
  } catch (error) {
    console.error('删除PI失败:', error)
    return NextResponse.json(
      { error: '删除PI失败' },
      { status: 500 }
    )
  }
}