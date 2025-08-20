import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Calendar, Shield, Eye, EyeOff } from 'lucide-react'
import type { User as UserType } from '@/types/admin'
import LoadingSpinner from '../common/LoadingSpinner'

interface UserFormProps {
  user?: UserType | null
  onSubmit: (userData: Partial<UserType>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'admin' | 'user',
    status: 'active' as 'active' | 'inactive',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        status: user.status || 'active',
        password: '',
        confirmPassword: ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        status: 'active',
        password: '',
        confirmPassword: ''
      })
    }
    setErrors({})
  }, [user])

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 姓名验证
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '姓名至少需要2个字符'
    }

    // 邮箱验证
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    // 手机号验证（可选）
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码'
    }

    // 密码验证（新建用户时必填）
    if (!user) {
      if (!formData.password) {
        newErrors.password = '密码不能为空'
      } else if (formData.password.length < 6) {
        newErrors.password = '密码至少需要6个字符'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致'
      }
    } else {
      // 编辑用户时，如果输入了密码则需要验证
      if (formData.password) {
        if (formData.password.length < 6) {
          newErrors.password = '密码至少需要6个字符'
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = '两次输入的密码不一致'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<UserType> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        status: formData.status
      }

      // 只有在密码不为空时才包含密码
      if (formData.password) {
        submitData.password = formData.password
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('提交用户表单失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!user

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
        {/* 姓名 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入姓名"
            disabled={loading || isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* 邮箱 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            邮箱 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="请输入邮箱地址"
              disabled={loading || isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* 手机号 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            手机号
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="请输入手机号码"
              disabled={loading || isSubmitting}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* 权限设置 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          权限设置
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 角色 */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              角色
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>

          {/* 状态 */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="active">激活</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
        </div>
      </div>

      {/* 密码设置 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? '修改密码（可选）' : '设置密码'}
        </h3>
        
        {/* 密码 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密码 {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder={isEditing ? '留空则不修改密码' : '请输入密码'}
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* 确认密码 */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            确认密码 {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="请再次输入密码"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading || isSubmitting}
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={loading || isSubmitting}
        >
          {(loading || isSubmitting) && (
            <LoadingSpinner size="sm" className="mr-2" />
          )}
          {isEditing ? '更新用户' : '创建用户'}
        </button>
      </div>
    </form>
  )
}

export default UserForm