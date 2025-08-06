import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

// 获取单个开发工具
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const tool = await db.tool.findUnique({
      where: { id: parseInt(resolvedParams.id) }
    })

    if (!tool) {
      return NextResponse.json(
        { error: '开发工具不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(tool)
  } catch (error) {
    console.error('获取开发工具失败:', error)
    return NextResponse.json(
      { error: '获取开发工具失败' },
      { status: 500 }
    )
  }
}

// 更新开发工具
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    const body = await request.json()
    const { name, description, url, category, image, reference, tags } = body
    const currentUserId = getCurrentUserId(request)

    // 准备更新数据，暂时不设置updatedBy以避免外键约束问题
    const updateData: any = {
      name,
      description,
      url,
      category,
      image,
      reference,
      tags
    }

    const tool = await db.tool.update({
      where: { id: parseInt(resolvedParams.id) },
      data: updateData
    })

    return NextResponse.json(tool)
  } catch (error) {
    console.error('更新开发工具失败:', error)
    return NextResponse.json(
      { error: '更新开发工具失败' },
      { status: 500 }
    )
  }
}

// 删除开发工具
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    await db.tool.delete({
      where: { id: parseInt(resolvedParams.id) }
    })

    return NextResponse.json({ message: '开发工具删除成功' })
  } catch (error) {
    console.error('删除开发工具失败:', error)
    return NextResponse.json(
      { error: '删除开发工具失败' },
      { status: 500 }
    )
  }
}