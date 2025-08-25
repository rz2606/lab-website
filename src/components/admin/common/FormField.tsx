'use client'

import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// 基础输入框属性
interface BaseFieldProps {
  label?: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
  labelClassName?: string
  inputClassName?: string
  errorClassName?: string
  successClassName?: string
  hintClassName?: string
}

// 文本输入框
interface TextFieldProps extends BaseFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'email' | 'url' | 'tel' | 'search'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showCharCount?: boolean
  maxLength?: number
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>((
  {
    label,
    error,
    success,
    hint,
    required,
    disabled,
    loading,
    className = '',
    labelClassName = '',
    inputClassName = '',
    errorClassName = '',
    successClassName = '',
    hintClassName = '',
    type = 'text',
    leftIcon,
    rightIcon,
    showCharCount,
    maxLength,
    value = '',
    ...props
  },
  ref
) => {
  const hasError = !!error
  const hasSuccess = !!success && !hasError
  const charCount = String(value).length

  return (
    <div className={cn('space-y-1', className)}>
      {/* 标签 */}
      {label && (
        <label className={cn(
          'block text-sm font-medium text-gray-700',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
          disabled && 'text-gray-400',
          labelClassName
        )}>
          {label}
        </label>
      )}

      {/* 输入框容器 */}
      <div className="relative">
        {/* 左侧图标 */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={cn(
              'text-gray-400',
              hasError && 'text-red-400',
              hasSuccess && 'text-green-400'
            )}>
              {leftIcon}
            </div>
          </div>
        )}

        {/* 输入框 */}
        <input
          ref={ref}
          type={type}
          value={value}
          disabled={disabled || loading}
          maxLength={maxLength}
          className={cn(
            // 基础样式
            'block w-full rounded-md border-gray-300 shadow-sm transition-colors duration-200',
            'focus:ring-2 focus:ring-offset-0 focus:outline-none',
            'placeholder-gray-400',
            
            // 左侧图标间距
            leftIcon && 'pl-10',
            
            // 右侧图标间距
            (rightIcon || hasError || hasSuccess || loading) && 'pr-10',
            
            // 状态样式
            hasError && [
              'border-red-300 text-red-900 placeholder-red-300',
              'focus:border-red-500 focus:ring-red-500'
            ],
            hasSuccess && [
              'border-green-300 text-green-900',
              'focus:border-green-500 focus:ring-green-500'
            ],
            !hasError && !hasSuccess && [
              'border-gray-300 text-gray-900',
              'focus:border-blue-500 focus:ring-blue-500'
            ],
            
            // 禁用状态
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            loading && 'bg-gray-50',
            
            inputClassName
          )}
          {...props}
        />

        {/* 右侧图标区域 */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          ) : hasError ? (
            <AlertCircle className="h-4 w-4 text-red-400" />
          ) : hasSuccess ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            rightIcon && (
              <div className="text-gray-400">
                {rightIcon}
              </div>
            )
          )}
        </div>
      </div>

      {/* 字符计数 */}
      {showCharCount && maxLength && (
        <div className="flex justify-end">
          <span className={cn(
            'text-xs',
            charCount > maxLength * 0.9 ? 'text-yellow-600' : 'text-gray-500',
            charCount >= maxLength ? 'text-red-600' : ''
          )}>
            {charCount}/{maxLength}
          </span>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-red-600',
          errorClassName
        )}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 成功信息 */}
      {success && !error && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-green-600',
          successClassName
        )}>
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 提示信息 */}
      {hint && !error && !success && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-gray-500',
          hintClassName
        )}>
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  )
})

TextField.displayName = 'TextField'

// 密码输入框
interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'rightIcon'> {
  showToggle?: boolean
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>((
  {
    showToggle = true,
    ...props
  },
  ref
) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <TextField
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        showToggle ? (
          <button
            type="button"
            onClick={togglePassword}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        ) : undefined
      }
      {...props}
    />
  )
})

PasswordField.displayName = 'PasswordField'

// 数字输入框
interface NumberFieldProps extends BaseFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  allowDecimals?: boolean
  allowNegative?: boolean
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>((
  {
    allowDecimals = true,
    allowNegative = true,
    onKeyDown,
    ...props
  },
  ref
) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 允许的按键
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]

    // 数字键
    const isNumber = /^[0-9]$/.test(e.key)
    
    // 小数点
    const isDecimal = e.key === '.' && allowDecimals
    
    // 负号
    const isNegative = e.key === '-' && allowNegative && e.currentTarget.selectionStart === 0

    // Ctrl/Cmd + A/C/V/X/Z
    const isCtrlKey = (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())

    if (!allowedKeys.includes(e.key) && !isNumber && !isDecimal && !isNegative && !isCtrlKey) {
      e.preventDefault()
    }

    onKeyDown?.(e)
  }

  return (
    <TextField
      ref={ref}
      type="text"
      inputMode="numeric"
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})

NumberField.displayName = 'NumberField'

// 文本域
interface TextAreaFieldProps extends BaseFieldProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  showCharCount?: boolean
  autoResize?: boolean
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>((
  {
    label,
    error,
    success,
    hint,
    required,
    disabled,
    loading,
    className = '',
    labelClassName = '',
    inputClassName = '',
    errorClassName = '',
    successClassName = '',
    hintClassName = '',
    showCharCount,
    autoResize,
    maxLength,
    value = '',
    rows = 3,
    ...props
  },
  ref
) => {
  const hasError = !!error
  const hasSuccess = !!success && !hasError
  const charCount = String(value).length

  return (
    <div className={cn('space-y-1', className)}>
      {/* 标签 */}
      {label && (
        <label className={cn(
          'block text-sm font-medium text-gray-700',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
          disabled && 'text-gray-400',
          labelClassName
        )}>
          {label}
        </label>
      )}

      {/* 文本域 */}
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          disabled={disabled || loading}
          maxLength={maxLength}
          rows={autoResize ? undefined : rows}
          className={cn(
            // 基础样式
            'block w-full rounded-md border-gray-300 shadow-sm transition-colors duration-200',
            'focus:ring-2 focus:ring-offset-0 focus:outline-none',
            'placeholder-gray-400',
            
            // 自动调整高度
            autoResize && 'resize-none',
            !autoResize && 'resize-vertical',
            
            // 状态样式
            hasError && [
              'border-red-300 text-red-900 placeholder-red-300',
              'focus:border-red-500 focus:ring-red-500'
            ],
            hasSuccess && [
              'border-green-300 text-green-900',
              'focus:border-green-500 focus:ring-green-500'
            ],
            !hasError && !hasSuccess && [
              'border-gray-300 text-gray-900',
              'focus:border-blue-500 focus:ring-blue-500'
            ],
            
            // 禁用状态
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            loading && 'bg-gray-50',
            
            inputClassName
          )}
          {...props}
        />

        {/* 加载状态 */}
        {loading && (
          <div className="absolute top-3 right-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          </div>
        )}
      </div>

      {/* 字符计数 */}
      {showCharCount && maxLength && (
        <div className="flex justify-end">
          <span className={cn(
            'text-xs',
            charCount > maxLength * 0.9 ? 'text-yellow-600' : 'text-gray-500',
            charCount >= maxLength ? 'text-red-600' : ''
          )}>
            {charCount}/{maxLength}
          </span>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-red-600',
          errorClassName
        )}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 成功信息 */}
      {success && !error && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-green-600',
          successClassName
        )}>
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 提示信息 */}
      {hint && !error && !success && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-gray-500',
          hintClassName
        )}>
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  )
})

TextAreaField.displayName = 'TextAreaField'

// 选择框
interface SelectFieldProps extends BaseFieldProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: Array<{ value: string | number; label: string; disabled?: boolean }>
  placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>((
  {
    label,
    error,
    success,
    hint,
    required,
    disabled,
    loading,
    className = '',
    labelClassName = '',
    inputClassName = '',
    errorClassName = '',
    successClassName = '',
    hintClassName = '',
    options,
    placeholder,
    ...props
  },
  ref
) => {
  const hasError = !!error
  const hasSuccess = !!success && !hasError

  return (
    <div className={cn('space-y-1', className)}>
      {/* 标签 */}
      {label && (
        <label className={cn(
          'block text-sm font-medium text-gray-700',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
          disabled && 'text-gray-400',
          labelClassName
        )}>
          {label}
        </label>
      )}

      {/* 选择框 */}
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled || loading}
          className={cn(
            // 基础样式
            'block w-full rounded-md border-gray-300 shadow-sm transition-colors duration-200',
            'focus:ring-2 focus:ring-offset-0 focus:outline-none',
            'bg-white',
            
            // 状态样式
            hasError && [
              'border-red-300 text-red-900',
              'focus:border-red-500 focus:ring-red-500'
            ],
            hasSuccess && [
              'border-green-300 text-green-900',
              'focus:border-green-500 focus:ring-green-500'
            ],
            !hasError && !hasSuccess && [
              'border-gray-300 text-gray-900',
              'focus:border-blue-500 focus:ring-blue-500'
            ],
            
            // 禁用状态
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            loading && 'bg-gray-50',
            
            inputClassName
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* 加载状态 */}
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-red-600',
          errorClassName
        )}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 成功信息 */}
      {success && !error && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-green-600',
          successClassName
        )}>
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 提示信息 */}
      {hint && !error && !success && (
        <div className={cn(
          'flex items-center space-x-1 text-sm text-gray-500',
          hintClassName
        )}>
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  )
})

SelectField.displayName = 'SelectField'

// 统一的表单字段组件
interface UnifiedFormFieldProps extends BaseFieldProps {
  type: 'text' | 'email' | 'url' | 'tel' | 'search' | 'password' | 'number' | 'textarea' | 'select'
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  placeholder?: string
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showCharCount?: boolean
  maxLength?: number
  rows?: number
  autoResize?: boolean
  allowDecimals?: boolean
  allowNegative?: boolean
  showToggle?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, UnifiedFormFieldProps>((
  {
    type,
    value,
    onChange,
    icon,
    leftIcon,
    options,
    ...props
  },
  ref
) => {
  // 处理onChange事件，传递完整的事件对象
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange?.(e)
  }

  // 设置leftIcon，优先使用传入的icon
  const finalLeftIcon = icon ? React.createElement(icon, { className: 'h-4 w-4' }) : leftIcon

  switch (type) {
    case 'select':
      return (
        <SelectField
          ref={ref as React.Ref<HTMLSelectElement>}
          value={value}
          onChange={handleChange}
          options={options || []}
          {...props}
        />
      )
    
    case 'textarea':
      return (
        <TextAreaField
          ref={ref as React.Ref<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          {...props}
        />
      )
    
    case 'password':
      return (
        <PasswordField
          ref={ref as React.Ref<HTMLInputElement>}
          value={value}
          onChange={handleChange}
          leftIcon={finalLeftIcon}
          {...props}
        />
      )
    
    case 'number':
      return (
        <NumberField
          ref={ref as React.Ref<HTMLInputElement>}
          value={value}
          onChange={handleChange}
          leftIcon={finalLeftIcon}
          {...props}
        />
      )
    
    default:
      return (
        <TextField
          ref={ref as React.Ref<HTMLInputElement>}
          type={type as 'text' | 'email' | 'url' | 'tel' | 'search'}
          value={value}
          onChange={handleChange}
          leftIcon={finalLeftIcon}
          {...props}
        />
      )
  }
})

FormField.displayName = 'FormField'

// 默认导出统一组件
export default FormField