import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Shield, Lock, Camera } from 'lucide-react'
import type { User as UserType } from '@/types/admin'
import { useFormValidation } from '@/hooks/useFormValidation'
import FormField from '../common/FormField'
import FileUpload from '@/components/FileUpload'
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
    username: '',
    name: '',
    email: '',
    phone: '',
    avatar: '',
    role: 'user' as 'admin' | 'user',
    status: 'active' as 'active' | 'inactive',
    password: '',
    confirmPassword: ''
  }

  const validationRules = {
    username: {
      required: true,
      minLength: 3
    },
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
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.roleType === 'admin' ? 'admin' : 'user',
        status: user.isActive ? 'active' : 'inactive',
        password: '',
        confirmPassword: ''
      }
      // 使用resetForm来设置新的初始值，避免依赖循环
      resetForm(userData)
    } else {
      // 重置为初始数据
      resetForm()
    }
  }, [user, resetForm])

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
        username: formData.username,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        avatar: formData.avatar,
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
            {/* 用户名 */}
            <FormField
              label="用户名"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              placeholder="请输入用户名"
              required
              disabled={loading || isSubmitting}
              leftIcon={<User className="h-4 w-4" />}
            />

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
              leftIcon={<User className="h-4 w-4" />}
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
              leftIcon={<Mail className="h-4 w-4" />}
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
              leftIcon={<Phone className="h-4 w-4" />}
            />
          </div>
          
          {/* 头像上传 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              头像
            </label>
            <FileUpload
              accept="image/*"
              maxSize={5}
              onChange={(url) => setFieldValue('avatar', url)}
              value={formData.avatar}
              placeholder="上传用户头像"
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
              leftIcon={<Shield className="h-4 w-4" />}
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
              leftIcon={<Shield className="h-4 w-4" />}
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
              leftIcon={<Lock className="h-4 w-4" />}
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
              leftIcon={<Lock className="h-4 w-4" />}
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