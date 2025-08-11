import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param format 格式类型
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return '无效日期'
  }
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('zh-CN')
    case 'long':
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'time':
      return d.toLocaleString('zh-CN')
    default:
      return d.toLocaleDateString('zh-CN')
  }
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}

/**
 * 生成随机ID
 * @param length ID长度
 * @returns 随机ID字符串
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}