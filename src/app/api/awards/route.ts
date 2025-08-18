import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth-middleware'

// 获取所有获奖记录
export async function GET() {
  try {
    const awards = await db.award.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(awards)
  } catch (error) {
    console.error('获取获奖记录失败:', error)
    return NextResponse.json(
      { error: '获取获奖记录失败' },
      { status: 500 }
    )
  }
}

// 创建新获奖记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serialNumber, awardee, awardDate, awardName, advisor, remarks } = body
    const currentUserId = getCurrentUserId(request)

    // 验证必填字段
    if (!awardee) {
      return NextResponse.json(
        { error: '获奖人员为必填项' },
        { status: 400 }
      )
    }

    if (!awardName) {
      return NextResponse.json(
        { error: '获奖名称为必填项' },
        { status: 400 }
      )
    }

    const award = await db.award.create({
      data: {
        serialNumber,
        awardee,
        awardDate: awardDate || null,
        awardName,
        advisor,
        remarks,
        createdBy: currentUserId,
        updatedBy: currentUserId
      }
    })

    return NextResponse.json(award, { status: 201 })
  } catch (error) {
    console.error('创建获奖记录失败:', error)
    return NextResponse.json(
      { error: '创建获奖记录失败' },
      { status: 500 }
    )
  }
}