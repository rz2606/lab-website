import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, getCurrentUserId } from '@/lib/auth-middleware'

export async function GET() {
  try {
    const publications = await db.publication.findMany({
      orderBy: { year: 'desc' }
    })
    return NextResponse.json(publications)
  } catch (error) {
    console.error('获取发表成果失败:', error)
    return NextResponse.json(
      { error: '获取发表成果失败' },
      { status: 500 }
    )
  }
}

// 创建新发表成果
export async function POST(request: NextRequest) {
  // 验证管理员权限
  const authResult = await requireAdmin(request)
  if (authResult) return authResult
  
  try {
    const body = await request.json()
    const { title, authors, journal, year, type, content } = body
    const currentUserId = getCurrentUserId(request)

    // 验证必填字段
    if (!title || !authors || !journal || !year) {
      return NextResponse.json(
        { error: '标题、作者、期刊和年份为必填项' },
        { status: 400 }
      )
    }

    const publication = await db.publication.create({
      data: {
        title,
        authors,
        journal,
        year: parseInt(year),
        type: type || 'paper',
        content,
        createdBy: currentUserId,
        updatedBy: currentUserId
      }
    })

    return NextResponse.json(publication, { status: 201 })
  } catch (error) {
    console.error('创建发表成果失败:', error)
    return NextResponse.json(
      { error: '创建发表成果失败' },
      { status: 500 }
    )
  }
}