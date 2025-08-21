import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Shield, Lock } from 'lucide-react'
import type { User as UserType } from '@/types/admin'
import { useFormValidation } from '@/hooks/useFormValidation'
import FormField from '../common/FormField'
import { useToast } from '@/components/ui/Toast'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success: showSuccess, error: showError } = useToast()

  const initialData = {
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'admin' | 'user',
    status: 'active' as 'active' | 'inactive',
    password: '',
    confirmPassword: ''
  }

  const validationRules = {
    name: {
      required: true,
      minLength: 2
    },
    email: {
      required: true,
      email: true
    },
    phone: {
      phone: true
    },
    password: {
      required: !user,
      minLength: 6
    }
  }

  const {
    values: formData,
    errors,
    handleChange,
    // handleSubmit: handleFormSubmit, // 未使用，已注释
    setFieldValue,
    resetForm,
    isValid
  } = useFormValidation(initialData, validationRules)

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        status: user.status || 'active',
        password: '',
        confirmPassword: ''
      }
      Object.keys(userData).forEach(key => {
        setFieldValue(key, userData[key as keyof typeof userData])
      })
    } else {
      resetForm()
    }
  }, [user, setFieldValue, resetForm])

  // 自定义验证函数
  const validatePasswords = (): boolean => {
    if (!user && !formData.password) {
      showError('新用户必须设置密码')
      return false
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      showError('两次输入的密码不一致')
      return false
    }
    
    return true
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleChange(e)
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    if (!isValid) {
      showError('请检查表单中的错误信息')
      return
    }

    // 验证密码
    if (!validatePasswords()) {
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
      showSuccess(user ? '用户更新成功' : '用户创建成功')
    } catch (error) {
      console.error('提交用户表单失败:', error)
      showError(user ? '用户更新失败' : '用户创建失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!user

  return (
    <div className="relative">
      {(loading || isSubmitting) && (
        <div className="loading-overlay">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本信息 */}
        <div className="form-group">
          <h3 className="form-group-title flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            基本信息
          </h3>
          
          <div className="form-grid">
            {/* 姓名 */}
            <FormField
              label="姓名"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="请输入姓名"
              required
              disabled={loading || isSubmitting}
              leftIcon={User}
            />

            {/* 邮箱 */}
            <FormField
              label="邮箱"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="请输入邮箱地址"
              required
              disabled={loading || isSubmitting}
              leftIcon={Mail}
            />
          </div>
          
          <div className="form-grid single">
            {/* 手机号 */}
            <FormField
              label="手机号"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              placeholder="请输入手机号码"
              disabled={loading || isSubmitting}
              leftIcon={Phone}
            />
          </div>
        </div>

        {/* 权限设置 */}
        <div className="form-group">
          <h3 className="form-group-title flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            权限设置
          </h3>
          
          <div className="form-grid">
            {/* 角色 */}
            <FormField
              type="select"
              label="角色"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled={loading || isSubmitting}
              leftIcon={Shield}
              options={[
                { value: 'user', label: '普通用户' },
                { value: 'admin', label: '管理员' }
              ]}
            />

            {/* 状态 */}
            <FormField
              type="select"
              label="状态"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading || isSubmitting}
              leftIcon={Shield}
              options={[
                { value: 'active', label: '激活' },
                { value: 'inactive', label: '禁用' }
              ]}
            />
          </div>
        </div>

        {/* 密码设置 */}
        <div className="form-group">
          <h3 className="form-group-title flex items-center">
            <Lock className="h-5 w-5 mr-2 text-purple-600" />
            {isEditing ? '修改密码（可选）' : '设置密码'}
          </h3>
          
          <div className="form-grid">
            {/* 密码 */}
            <FormField
              type="password"
              label="密码"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder={isEditing ? '留空则不修改密码' : '请输入密码'}
              required={!isEditing}
              disabled={loading || isSubmitting}
              leftIcon={Lock}
            />

            {/* 确认密码 */}
            <FormField
              type="password"
              label="确认密码"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="请再次输入密码"
              required={!isEditing}
              disabled={loading || isSubmitting}
              leftIcon={Lock}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="btn-enhanced btn-secondary"
            disabled={loading || isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-enhanced btn-primary"
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? '更新中...' : '创建中...'}
              </div>
            ) : (
              isEditing ? '更新用户' : '创建用户'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm