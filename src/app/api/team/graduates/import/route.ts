import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

// Excel导入毕业生数据
export async function POST(request: NextRequest) {
  try {
    // 暂时移除用户验证，因为我们不再使用 createdBy 和 updatedBy 字段

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

    // 验证Excel表头 - 将职位和公司设为可选字段
    const requiredHeaders = ['序号', '姓名', '入学时间', '毕业时间', '指导老师', '学位', '学科', '论文题目', '是否有论文', '备注']
    const optionalHeaders = ['职位', '公司'] // 可选字段
    const firstRow = jsonData[0] as Record<string, unknown>
    const headers = Object.keys(firstRow)
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Excel文件缺少必要的表头: ${missingHeaders.join(', ')}` },
        { status: 400 }
      )
    }
    
    // 记录缺少的可选字段（仅用于日志，不影响导入）
    const missingOptionalHeaders = optionalHeaders.filter(header => !headers.includes(header))
    if (missingOptionalHeaders.length > 0) {
      console.log(`Excel文件缺少可选表头: ${missingOptionalHeaders.join(', ')}，这些字段将设为空值`)
    }

    // 处理数据并批量插入
    const graduatesData = []
    const errors = []
    const skippedRows = []

    console.log(`开始处理 ${jsonData.length} 条记录`)

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>
      
      try {
        // 验证必填字段 - 更严格的姓名验证
        const name = row['姓名']
        if (!name || typeof name !== 'string' || name.trim() === '') {
          const errorMsg = `第${i + 2}行: 姓名不能为空或无效 (值: ${JSON.stringify(name)})`
          errors.push(errorMsg)
          skippedRows.push({ row: i + 2, reason: '姓名为空或无效', data: row })
          console.log(errorMsg)
          continue
        }

        // 处理日期字段 - 直接返回原始字符串，不做任何转换
        const parseDate = (dateValue: unknown, fieldName: string) => {
          console.log(`处理日期字段 ${fieldName}:`, { value: dateValue, type: typeof dateValue })
          
          if (!dateValue || dateValue === '') {
            console.log(`${fieldName} 为空，返回 null`)
            return null
          }
          
          // 直接返回原始字符串，不做任何日期转换
          const stringValue = String(dateValue).trim()
          console.log(`${fieldName} 原始字符串值:`, stringValue)
          return stringValue || null
        }

        // 解析是否有论文字段
        const parseHasPaper = (value: unknown) => {
          if (value === null || value === undefined || value === '') return null
          
          const strValue = String(value).trim().toLowerCase()
          
          // 支持多种输入格式
          if (['是', '有', 'true', '1', 'yes', 'y'].includes(strValue)) {
            return true
          }
          if (['否', '无', 'false', '0', 'no', 'n'].includes(strValue)) {
            return false
          }
          
          return null
        }

        const graduateData = {
          serialNumber: row['序号'] ? String(row['序号']) : null,
          name: name.trim(), // 使用验证后的name值
          enrollmentDate: parseDate(row['入学时间'], '入学时间'),
          graduationDate: parseDate(row['毕业时间'], '毕业时间'),
          advisor: row['指导老师'] ? String(row['指导老师']).trim() : null,
          degree: row['学位'] ? String(row['学位']).trim() : null,
          discipline: row['学科'] ? String(row['学科']).trim() : null,
          thesisTitle: row['论文题目'] ? String(row['论文题目']).trim() : null,
          position: row['职位'] ? String(row['职位']).trim() : null,
          company: row['公司'] ? String(row['公司']).trim() : null,
          remarks: row['备注'] ? String(row['备注']).trim() : null,
          hasPaper: parseHasPaper(row['是否有论文'])
          // 暂时移除 createdBy 和 updatedBy 字段，因为它们是可选的
        }

        console.log(`处理第${i + 2}行数据:`, {
          name: graduateData.name,
          serialNumber: graduateData.serialNumber,
          enrollmentDate: graduateData.enrollmentDate,
          graduationDate: graduateData.graduationDate,
          advisor: graduateData.advisor,
          degree: graduateData.degree,
          discipline: graduateData.discipline,
          hasPaper: graduateData.hasPaper
        })
        
        // 特别记录日期字段的原始值和解析结果
        console.log(`第${i + 2}行日期解析详情:`, {
          '入学时间原始值': row['入学时间'],
          '入学时间解析结果': graduateData.enrollmentDate,
          '毕业时间原始值': row['毕业时间'],
          '毕业时间解析结果': graduateData.graduationDate
        })
        graduatesData.push(graduateData)
      } catch (error) {
        const errorMsg = `第${i + 2}行: 数据处理失败 - ${error}`
        errors.push(errorMsg)
        skippedRows.push({ row: i + 2, reason: '数据处理异常', error: String(error), data: row })
        console.error(errorMsg, error)
      }
    }

    console.log(`数据处理完成: 有效数据 ${graduatesData.length} 条, 错误 ${errors.length} 条, 跳过 ${skippedRows.length} 条`)

    if (graduatesData.length === 0) {
      console.log('没有有效数据可导入，跳过的行:', skippedRows)
      return NextResponse.json(
        { 
          error: '没有有效的数据可以导入', 
          details: errors,
          skippedRows: skippedRows,
          totalProcessed: jsonData.length
        },
        { status: 400 }
      )
    }

    // 批量插入数据库
    console.log('开始批量插入数据库...')
    console.log('准备插入的数据样本:', graduatesData.slice(0, 2)) // 显示前2条数据作为样本
    
    const result = await db.graduate.createMany({
      data: graduatesData
      // 移除 skipDuplicates: true 以确保数据能够插入
    })
    console.log(`数据库插入完成: ${result.count} 条记录`)
    console.log('插入结果详情:', result)

    return NextResponse.json({
      success: true,
      message: `成功导入 ${result.count} 条毕业生记录`,
      imported: result.count,
      total: jsonData.length,
      processed: graduatesData.length,
      errors: errors.length > 0 ? errors : undefined,
      skippedRows: skippedRows.length > 0 ? skippedRows : undefined
    })

  } catch (error) {
    console.error('Excel导入失败:', error)
    return NextResponse.json(
      { error: '导入失败，请检查文件格式和内容' },
      { status: 500 }
    )
  }
}