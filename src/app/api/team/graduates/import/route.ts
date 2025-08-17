import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth-middleware'
import * as XLSX from 'xlsx'

// Excel导入毕业生数据
export async function POST(request: NextRequest) {
  try {
    const currentUserId = getCurrentUserId(request)
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
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
    const requiredHeaders = ['序号', '姓名', '入学时间', '毕业时间', '指导老师', '学位', '学科', '论文题目', '备注']
    const firstRow = jsonData[0] as any
    const headers = Object.keys(firstRow)
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Excel文件缺少必要的表头: ${missingHeaders.join(', ')}` },
        { status: 400 }
      )
    }

    // 处理数据并批量插入
    const graduatesData = []
    const errors = []

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any
      
      try {
        // 验证必填字段
        if (!row['姓名']) {
          errors.push(`第${i + 2}行: 姓名不能为空`)
          continue
        }

        // 处理日期字段
        const parseDate = (dateValue: any) => {
          if (!dateValue) return null
          
          // 如果是Excel日期序列号
          if (typeof dateValue === 'number') {
            const excelDate = new Date((dateValue - 25569) * 86400 * 1000)
            return excelDate
          }
          
          // 如果是字符串，尝试解析
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? null : date
          }
          
          return null
        }

        const graduateData = {
          serialNumber: row['序号'] ? String(row['序号']) : null,
          name: row['姓名'],
          enrollmentDate: parseDate(row['入学时间']),
          graduationDate: parseDate(row['毕业时间']),
          advisor: row['指导老师'] || null,
          degree: row['学位'] || null,
          discipline: row['学科'] || null,
          thesisTitle: row['论文题目'] || null,
          remarks: row['备注'] || null,
          createdBy: currentUserId,
          updatedBy: currentUserId
        }

        graduatesData.push(graduateData)
      } catch (error) {
        errors.push(`第${i + 2}行: 数据处理失败 - ${error}`)
      }
    }

    if (graduatesData.length === 0) {
      return NextResponse.json(
        { error: '没有有效的数据可以导入', details: errors },
        { status: 400 }
      )
    }

    // 批量插入数据库
    const result = await db.graduate.createMany({
      data: graduatesData,
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      message: `成功导入 ${result.count} 条毕业生记录`,
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