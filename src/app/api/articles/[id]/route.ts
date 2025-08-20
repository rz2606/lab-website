import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/articles/[id] - 获取单篇文章详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id)
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: '无效的文章ID' },
        { status: 400 }
      )
    }

    const article = await prisma.article.findUnique({
      where: {
        id: articleId
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('获取文章详情失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// PUT /api/articles/[id] - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id)
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: '无效的文章ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      authors,
      journal,
      publishedDate,
      doi,
      abstract,
      keywords,
      impactFactor,
      category,
      citationCount,
      openAccess
    } = body

    // 验证必填字段
    if (!title || !authors || !journal || !publishedDate || !category) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 检查文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    // 更新文章
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        authors,
        journal,
        publishedDate: new Date(publishedDate),
        doi: doi || null,
        abstract: abstract || null,
        keywords: keywords || null,
        impactFactor: impactFactor ? parseFloat(impactFactor) : null,
        category,
        citationCount: citationCount ? parseInt(citationCount) : null,
        openAccess: Boolean(openAccess)
      }
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error('更新文章失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[id] - 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id)
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: '无效的文章ID' },
        { status: 400 }
      )
    }

    // 检查文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    // 删除文章
    await prisma.article.delete({
      where: { id: articleId }
    })

    return NextResponse.json({ message: '文章删除成功' })
  } catch (error) {
    console.error('删除文章失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}