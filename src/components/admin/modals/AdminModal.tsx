import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  overlayClassName?: string
  contentClassName?: string
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  contentClassName = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // 尺寸样式映射
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeOnEscape, onClose])

  // 焦点管理
  useEffect(() => {
    if (isOpen) {
      // 保存当前焦点元素
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // 将焦点移到模态框
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)
    } else {
      // 恢复之前的焦点
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  // 处理覆盖层点击
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${overlayClassName}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* 背景覆盖层 */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        {/* 垂直居中的技巧 */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* 模态框内容 */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all
            sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}
            ${className}
          `}
        >
          {/* 头部 */}
          <div className={`bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${contentClassName}`}>
            <div className="flex items-center justify-between mb-4">
              <h3
                id="modal-title"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                {title}
              </h3>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="关闭"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* 内容区域 */}
            <div className="mt-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 模态框底部按钮区域组件
export const ModalFooter: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${className}`}>
      {children}
    </div>
  )
}

// 模态框按钮组件
export const ModalButton: React.FC<{
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  loading?: boolean
  className?: string
}> = ({ 
  children, 
  onClick, 
  variant = 'secondary', 
  disabled = false, 
  loading = false,
  className = '' 
}) => {
  const baseClasses = 'w-full inline-flex justify-center rounded-md border px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors'
  
  const variantClasses = {
    primary: 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100',
    danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          处理中...
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default AdminModal