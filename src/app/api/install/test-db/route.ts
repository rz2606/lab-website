import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

interface DatabaseConfig {
  host: string
  port: string
  username: string
  password: string
  database: string
}

export async function POST(request: NextRequest) {
  try {
    const config: DatabaseConfig = await request.json()
    
    // 验证必填字段
    if (!config.host || !config.port || !config.username || !config.database) {
      return NextResponse.json(
        { error: '请填写所有必填的数据库配置字段' },
        { status: 400 }
      )
    }
    
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: config.host,
      port: parseInt(config.port),
      user: config.username,
      password: config.password,
      database: config.database,
      connectTimeout: 10000, // 10秒超时
      acquireTimeout: 10000,
      timeout: 10000
    })
    
    // 测试连接
    await connection.execute('SELECT 1')
    
    // 关闭连接
    await connection.end()
    
    return NextResponse.json(
      { success: true, message: '数据库连接测试成功' },
      { status: 200 }
    )
    
  } catch (error: any) {
    console.error('数据库连接测试失败:', error)
    
    let errorMessage = '数据库连接失败'
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = '无法连接到数据库服务器，请检查主机和端口'
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = '数据库用户名或密码错误'
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = '指定的数据库不存在'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = '数据库连接超时'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}