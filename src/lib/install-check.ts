import fs from 'fs/promises'
import path from 'path'

/**
 * 检查系统是否已安装
 * @returns Promise<boolean> 返回安装状态
 */
export async function isSystemInstalled(): Promise<boolean> {
  try {
    const projectRoot = process.cwd()
    
    // 检查.installed文件是否存在
    const installFlagPath = path.join(projectRoot, '.installed')
    try {
      const installFlag = await fs.readFile(installFlagPath, 'utf8')
      const installInfo = JSON.parse(installFlag)
      if (installInfo.status === 'completed') {
        return true
      }
    } catch {
      // .installed文件不存在或格式错误，继续检查环境变量
    }
    
    // 检查环境变量SYSTEM_INSTALLED
    if (process.env.SYSTEM_INSTALLED === 'true') {
      return true
    }
    
    // 检查.env文件中的SYSTEM_INSTALLED
    const envPath = path.join(projectRoot, '.env')
    try {
      const envContent = await fs.readFile(envPath, 'utf8')
      const match = envContent.match(/SYSTEM_INSTALLED="?([^"\n]*)"?/)
      if (match && match[1] === 'true') {
        return true
      }
    } catch {
      // .env文件不存在或读取失败
    }
    
    return false
  } catch (error) {
    console.error('检查安装状态失败:', error)
    return false
  }
}

/**
 * 检查数据库连接是否配置
 * @returns Promise<boolean> 返回数据库配置状态
 */
export async function isDatabaseConfigured(): Promise<boolean> {
  try {
    // 检查环境变量DATABASE_URL
    if (process.env.DATABASE_URL) {
      return true
    }
    
    // 检查.env文件中的DATABASE_URL
    const projectRoot = process.cwd()
    const envPath = path.join(projectRoot, '.env')
    try {
      const envContent = await fs.readFile(envPath, 'utf8')
      const match = envContent.match(/DATABASE_URL="?([^"\n]*)"?/)
      if (match && match[1]) {
        return true
      }
    } catch {
      // .env文件不存在或读取失败
    }
    
    return false
  } catch (error) {
    console.error('检查数据库配置失败:', error)
    return false
  }
}

/**
 * 获取安装信息
 * @returns Promise<object | null> 返回安装信息或null
 */
export async function getInstallationInfo(): Promise<any> {
  try {
    const projectRoot = process.cwd()
    const installFlagPath = path.join(projectRoot, '.installed')
    
    const installFlag = await fs.readFile(installFlagPath, 'utf8')
    return JSON.parse(installFlag)
  } catch {
    return null
  }
}