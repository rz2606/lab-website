'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { createPortal } from 'react-dom'

// Toast类型定义
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Toast配置
const toastConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-600'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-600'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-600'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-600'
  }
}

// Toast Context
interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }

    setToasts(prev => [...prev, newToast])

    // 自动移除
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [removeToast])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Toast Hook
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast, removeToast, clearToasts } = context

  // 便捷方法
  const toast = {
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => 
      addToast({ type: 'success', message, ...options }),
    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => 
      addToast({ type: 'error', message, ...options }),
    warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => 
      addToast({ type: 'warning', message, ...options }),
    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => 
      addToast({ type: 'info', message, ...options })
  }

  return {
    toast,
    addToast,
    removeToast,
    clearToasts
  }
}

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof window === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts && Array.isArray(toasts) ? toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      )) : null}
    </div>,
    document.body
  )
}

// Toast Item
const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const config = toastConfig[toast.type]
  const Icon = config.icon

  useEffect(() => {
    // 进入动画
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      removeToast(toast.id)
    }, 300)
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${config.className}
        border rounded-lg shadow-lg p-4 relative
        max-w-sm w-full
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconClassName}`} />
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-medium mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-sm">
            {toast.message}
          </p>
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// 简单的错误提示组件
export const ErrorAlert: React.FC<{
  title?: string
  message: string
  onClose?: () => void
  className?: string
}> = ({ title, message, onClose, className = '' }) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium text-red-800 mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm text-red-700">
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto pl-3"
          >
            <X className="w-5 h-5 text-red-600 hover:text-red-800" />
          </button>
        )}
      </div>
    </div>
  )
}

// 成功提示组件
export const SuccessAlert: React.FC<{
  title?: string
  message: string
  onClose?: () => void
  className?: string
}> = ({ title, message, onClose, className = '' }) => {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium text-green-800 mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm text-green-700">
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto pl-3"
          >
            <X className="w-5 h-5 text-green-600 hover:text-green-800" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ToastProvider