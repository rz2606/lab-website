import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// Excel导入获奖数据
export async function POST(request: NextRequest) {
  try {
    // 查询数据库中是否存在用户，如果存在则使用第一个用户的ID
    let currentUserId: number | null = null
    try {
      const firstUser = await prisma.user.findFirst({
        select: { id: true }
      })
      currentUserId = firstUser?.id || null
      console.log('找到的用户ID:', currentUserId)
    } catch (userError) {
      console.log('查询用户失败，将使用null作为createdBy/updatedBy:', userError)
      currentUserId = null
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '请选择要导入的Excel文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '请上传Excel文件(.xlsx或.xls格式)' },
        { status: 400 }
      )
    }

    // 读取Excel文件
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel文件中没有数据' },
        { status: 400 }
      )
    }

    // 验证Excel表头
    const requiredHeaders = ['序号', '获奖人员', '获奖时间', '获奖名称及等级', '指导老师']
    const firstRow = jsonData[0] as Record<string, unknown>
    const headers = Object.keys(firstRow)
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Excel文件缺少必要的表头: ${missingHeaders.join(', ')}` },
        { status: 400 }
      )
    }

    // 处理数据并批量插入
    const awardsData = []
    const errors = []

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>
      
      try {
        // 验证必填字段
        if (!row['获奖人员']) {
          errors.push(`第${i + 2}行: 获奖人员不能为空`)
          continue
        }

        if (!row['获奖名称及等级']) {
          errors.push(`第${i + 2}行: 获奖名称及等级不能为空`)
          continue
        }

        // 处理日期字段 - 直接存储原始字符串格式
        const parseDate = (dateValue: unknown) => {
          if (!dateValue) return null
          
          // 直接返回字符串格式，保持原始数据
          return String(dateValue).trim()
        }

        const awardData = {
          serialNumber: row['序号'] ? String(row['序号']) : null,
          awardee: row['获奖人员'],
          awardDate: parseDate(row['获奖时间']),
          awardName: row['获奖名称及等级'],
          advisor: row['指导老师'] || null,
          remarks: row['备注'] || null,
          createdBy: currentUserId,
          updatedBy: currentUserId
        }
        
        console.log(`处理第${i + 2}行数据:`, awardData)

        awardsData.push(awardData)
      } catch (error) {
        errors.push(`第${i + 2}行: 数据处理失败 - ${error}`)
      }
    }

    if (awardsData.length === 0) {
      return NextResponse.json(
        { error: '没有有效的数据可以导入', details: errors },
        { status: 400 }
      )
    }

    // 批量插入数据库
    console.log('准备插入的数据数量:', awardsData.length)
    console.log('插入数据示例:', awardsData[0])
    
    const result = await prisma.award.createMany({
      data: awardsData
      // 移除 skipDuplicates 以确保数据能够插入
    })
    
    console.log('数据库插入结果:', result)

    return NextResponse.json({
      success: true,
      message: `成功导入 ${result.count} 条获奖记录`,
      imported: result.count,
      total: jsonData.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Excel导入失败:', error)
    return NextResponse.json(
      { error: '导入失败，请检查文件格式和内容' },
      { status: 500 }
    )
  }
}