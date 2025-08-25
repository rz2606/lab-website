import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | '2xl'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  overlayClassName?: string
  contentClassName?: string
  loading?: boolean
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
  contentClassName = '',
  loading = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // 尺寸样式映射
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-7xl'
  }

  // 动画控制
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && !loading) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeOnEscape, onClose, loading])

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
    if (closeOnOverlayClick && event.target === event.currentTarget && !loading) {
      onClose()
    }
  }

  // 处理关闭按钮点击
  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen && !isAnimating) {
    return null
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ease-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${overlayClassName}
      `}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* 背景覆盖层 - 增强视觉效果 */}
        <div
          className={`
            fixed inset-0 bg-gradient-to-br from-black/50 via-black/60 to-black/70 
            backdrop-blur-md transition-all duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0'}
          `}
          aria-hidden="true"
        />

        {/* 垂直居中的技巧 */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* 模态框内容 - 增强视觉层次 */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden 
            shadow-2xl ring-1 ring-black/5 transform transition-all duration-300 ease-out
            sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}
            border border-gray-200/30
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
            ${className}
          `}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* 头部 - 优化视觉层次 */}
          <div className={`
            bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 px-8 py-6 border-b border-gray-200/60
            ${contentClassName}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                <div>
                  <h3
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900 tracking-tight leading-tight"
                  >
                    {title}
                  </h3>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500/60 to-transparent mt-1 rounded-full"></div>
                </div>
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className={`
                    p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-100/80
                    transition-all duration-200 group backdrop-blur-sm
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  aria-label="关闭模态框"
                >
                  <X className="h-5 w-5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-200" />
                </button>
              )}
            </div>
          </div>

          {/* 内容区域 - 优化间距和滚动 */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-10 flex items-center justify-center rounded-b-2xl">
                <div className="flex items-center space-x-3 bg-white/80 px-6 py-4 rounded-xl shadow-lg border border-gray-200/50">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-700 font-medium">处理中...</span>
                </div>
              </div>
            )}
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 模态框底部按钮区域组件 - 增强视觉效果
export const ModalFooter: React.FC<{
  children: React.ReactNode
  className?: string
  justify?: 'start' | 'center' | 'end' | 'between'
}> = ({ children, className = '', justify = 'end' }) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center', 
    end: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div className={`
      bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 px-8 py-5 border-t border-gray-200/60
      flex items-center ${justifyClasses[justify]} gap-3
      backdrop-blur-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

// 模态框按钮组件
export const ModalButton: React.FC<{
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
}> = ({ 
  children, 
  onClick, 
  variant = 'secondary', 
  disabled = false, 
  loading = false,
  size = 'md',
  className = '',
  type = 'button'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-base'
      case 'md':
      default:
        return 'px-4 py-2 text-sm'
    }
  }
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500/30 shadow-lg hover:shadow-xl border-transparent',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500/30 shadow-lg hover:shadow-xl border-transparent',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500/30 shadow-lg hover:shadow-xl border-transparent',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-blue-500/30 shadow-sm hover:shadow-md'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getSizeClasses()} rounded-xl font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-105 active:scale-95 hover:-translate-y-0.5
        ${variantClasses[variant]}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>处理中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default AdminModal