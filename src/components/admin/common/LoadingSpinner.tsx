import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
  overlay?: boolean
  fullScreen?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
  overlay = false,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

// 简单的内联加载器
export const InlineSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
  )
}

// 按钮加载状态
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
  )
}

// 表格加载状态
export const TableLoadingRow: React.FC<{ colSpan: number; text?: string }> = ({ 
  colSpan, 
  text = '加载中...' 
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500">{text}</p>
        </div>
      </td>
    </tr>
  )
}

// 卡片加载状态
export const CardLoading: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-md h-4 mb-2"></div>
      <div className="bg-gray-200 rounded-md h-4 mb-2 w-3/4"></div>
      <div className="bg-gray-200 rounded-md h-4 w-1/2"></div>
    </div>
  )
}

// 页面加载状态
export const PageLoading: React.FC<{ text?: string }> = ({ text = '页面加载中...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-lg text-gray-600">{text}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner