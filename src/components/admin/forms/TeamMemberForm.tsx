import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Calendar, Users, Globe, Github, Linkedin, Twitter } from 'lucide-react'
import type { TeamMember, TeamMemberType } from '@/types/admin'
import LoadingSpinner from '../common/LoadingSpinner'

interface TeamMemberFormProps {
  member?: TeamMember | null
  onSubmit: (memberData: Partial<TeamMember>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  member,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    type: 'faculty' as TeamMemberType,
    bio: '',
    avatar: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    researchInterests: [] as string[],
    education: '',
    joinDate: '',
    status: 'active' as 'active' | 'inactive'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [researchInput, setResearchInput] = useState('')

  // 初始化表单数据
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        position: member.position || '',
        department: member.department || '',
        type: member.type || 'faculty',
        bio: member.bio || '',
        avatar: member.avatar || '',
        website: member.website || '',
        github: member.github || '',
        linkedin: member.linkedin || '',
        twitter: member.twitter || '',
        researchInterests: member.researchInterests || [],
        education: member.education || '',
        joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : '',
        status: member.status || 'active'
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        type: 'faculty',
        bio: '',
        avatar: '',
        website: '',
        github: '',
        linkedin: '',
        twitter: '',
        researchInterests: [],
        education: '',
        joinDate: '',
        status: 'active'
      })
    }
    setErrors({})
  }, [member])

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

    // 职位验证
    if (!formData.position.trim()) {
      newErrors.position = '职位不能为空'
    }

    // 部门验证
    if (!formData.department.trim()) {
      newErrors.department = '部门不能为空'
    }

    // URL验证
    const urlFields = ['website', 'github', 'linkedin', 'twitter']
    urlFields.forEach(field => {
      const value = formData[field as keyof typeof formData] as string
      if (value && !isValidUrl(value)) {
        newErrors[field] = '请输入有效的URL地址'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // URL验证函数
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 添加研究兴趣
  const addResearchInterest = () => {
    if (researchInput.trim() && !formData.researchInterests.includes(researchInput.trim())) {
      handleInputChange('researchInterests', [...formData.researchInterests, researchInput.trim()])
      setResearchInput('')
    }
  }

  // 删除研究兴趣
  const removeResearchInterest = (index: number) => {
    const newInterests = formData.researchInterests.filter((_, i) => i !== index)
    handleInputChange('researchInterests', newInterests)
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<TeamMember> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        position: formData.position.trim(),
        department: formData.department.trim(),
        type: formData.type,
        bio: formData.bio.trim() || undefined,
        avatar: formData.avatar.trim() || undefined,
        website: formData.website.trim() || undefined,
        github: formData.github.trim() || undefined,
        linkedin: formData.linkedin.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        researchInterests: formData.researchInterests.length > 0 ? formData.researchInterests : undefined,
        education: formData.education.trim() || undefined,
        joinDate: formData.joinDate ? new Date(formData.joinDate).toISOString() : undefined,
        status: formData.status
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('提交团队成员表单失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!member

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* 头像URL */}
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
              头像URL
            </label>
            <input
              type="url"
              id="avatar"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入头像图片URL"
              disabled={loading || isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* 职位信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          职位信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 职位 */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              职位 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.position ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="请输入职位"
              disabled={loading || isSubmitting}
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position}</p>
            )}
          </div>

          {/* 部门 */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              部门 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.department ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="请输入部门"
              disabled={loading || isSubmitting}
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          {/* 成员类型 */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              成员类型
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as TeamMemberType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="faculty">教职工</option>
              <option value="student">学生</option>
              <option value="postdoc">博士后</option>
              <option value="visiting">访问学者</option>
              <option value="alumni">校友</option>
            </select>
          </div>

          {/* 入职日期 */}
          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
              入职日期
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="joinDate"
                value={formData.joinDate}
                onChange={(e) => handleInputChange('joinDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || isSubmitting}
              />
            </div>
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
              <option value="active">在职</option>
              <option value="inactive">离职</option>
            </select>
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          详细信息
        </h3>
        
        {/* 个人简介 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            个人简介
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入个人简介"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 教育背景 */}
        <div>
          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
            教育背景
          </label>
          <textarea
            id="education"
            value={formData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入教育背景"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 研究兴趣 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            研究兴趣
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={researchInput}
              onChange={(e) => setResearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResearchInterest())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入研究兴趣并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addResearchInterest}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !researchInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.researchInterests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.researchInterests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeResearchInterest(index)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                    disabled={loading || isSubmitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 社交链接 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          社交链接
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 个人网站 */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              个人网站
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.website ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="https://example.com"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website}</p>
            )}
          </div>

          {/* GitHub */}
          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="github"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.github ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="https://github.com/username"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.github && (
              <p className="mt-1 text-sm text-red-600">{errors.github}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Linkedin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.linkedin ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="https://linkedin.com/in/username"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.linkedin && (
              <p className="mt-1 text-sm text-red-600">{errors.linkedin}</p>
            )}
          </div>

          {/* Twitter */}
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
              Twitter
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Twitter className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="twitter"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.twitter ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="https://twitter.com/username"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.twitter && (
              <p className="mt-1 text-sm text-red-600">{errors.twitter}</p>
            )}
          </div>
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
          {isEditing ? '更新成员' : '添加成员'}
        </button>
      </div>
    </form>
  )
}

export default TeamMemberForm