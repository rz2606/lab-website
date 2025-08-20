import React, { useState, useEffect } from 'react'
import { Award, Calendar, Users, Building, Link, FileText, Star, Trophy } from 'lucide-react'
import type { Award as AwardType } from '@/types/admin'
import LoadingSpinner from '../common/LoadingSpinner'

interface AwardFormProps {
  award?: AwardType | null
  onSubmit: (awardData: Partial<AwardType>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const AwardForm: React.FC<AwardFormProps> = ({
  award,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'academic' as 'academic' | 'research' | 'innovation' | 'service' | 'teaching' | 'competition' | 'honor',
    level: 'international' as 'international' | 'national' | 'provincial' | 'municipal' | 'institutional' | 'departmental',
    rank: 'first' as 'first' | 'second' | 'third' | 'excellence' | 'participation' | 'nomination',
    organization: '',
    organizer: '',
    awardDate: '',
    winners: [] as string[],
    winnerIds: [] as string[],
    certificateUrl: '',
    newsUrl: '',
    externalUrl: '',
    images: [] as string[],
    tags: [] as string[],
    category: '',
    prizeAmount: 0,
    currency: 'CNY' as 'CNY' | 'USD' | 'EUR',
    criteria: '',
    significance: '',
    impact: '',
    relatedProjects: [] as string[],
    relatedPublications: [] as string[],
    status: 'confirmed' as 'confirmed' | 'pending' | 'nominated' | 'declined',
    visibility: 'public' as 'public' | 'internal' | 'private',
    featured: false,
    notes: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [winnerInput, setWinnerInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [projectInput, setProjectInput] = useState('')
  const [publicationInput, setPublicationInput] = useState('')

  // 初始化表单数据
  useEffect(() => {
    if (award) {
      setFormData({
        name: award.name || '',
        description: award.description || '',
        type: award.type || 'academic',
        level: award.level || 'international',
        rank: award.rank || 'first',
        organization: award.organization || '',
        organizer: award.organizer || '',
        awardDate: award.awardDate ? new Date(award.awardDate).toISOString().split('T')[0] : '',
        winners: award.winners || [],
        winnerIds: award.winnerIds || [],
        certificateUrl: award.certificateUrl || '',
        newsUrl: award.newsUrl || '',
        externalUrl: award.externalUrl || '',
        images: award.images || [],
        tags: award.tags || [],
        category: award.category || '',
        prizeAmount: award.prizeAmount || 0,
        currency: award.currency || 'CNY',
        criteria: award.criteria || '',
        significance: award.significance || '',
        impact: award.impact || '',
        relatedProjects: award.relatedProjects || [],
        relatedPublications: award.relatedPublications || [],
        status: award.status || 'confirmed',
        visibility: award.visibility || 'public',
        featured: award.featured || false,
        notes: award.notes || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'academic',
        level: 'international',
        rank: 'first',
        organization: '',
        organizer: '',
        awardDate: new Date().toISOString().split('T')[0],
        winners: [],
        winnerIds: [],
        certificateUrl: '',
        newsUrl: '',
        externalUrl: '',
        images: [],
        tags: [],
        category: '',
        prizeAmount: 0,
        currency: 'CNY',
        criteria: '',
        significance: '',
        impact: '',
        relatedProjects: [],
        relatedPublications: [],
        status: 'confirmed',
        visibility: 'public',
        featured: false,
        notes: ''
      })
    }
    setErrors({})
  }, [award])

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 奖项名称验证
    if (!formData.name.trim()) {
      newErrors.name = '奖项名称不能为空'
    } else if (formData.name.length < 2) {
      newErrors.name = '奖项名称至少需要2个字符'
    } else if (formData.name.length > 200) {
      newErrors.name = '奖项名称不能超过200个字符'
    }

    // 描述验证
    if (!formData.description.trim()) {
      newErrors.description = '奖项描述不能为空'
    } else if (formData.description.length < 10) {
      newErrors.description = '奖项描述至少需要10个字符'
    } else if (formData.description.length > 2000) {
      newErrors.description = '奖项描述不能超过2000个字符'
    }

    // 颁发机构验证
    if (!formData.organization.trim()) {
      newErrors.organization = '颁发机构不能为空'
    }

    // 获奖者验证
    if (formData.winners.length === 0) {
      newErrors.winners = '至少需要一个获奖者'
    }

    // 获奖日期验证
    if (!formData.awardDate) {
      newErrors.awardDate = '获奖日期不能为空'
    } else {
      const awardDate = new Date(formData.awardDate)
      const today = new Date()
      if (awardDate > today) {
        newErrors.awardDate = '获奖日期不能晚于今天'
      }
    }

    // URL验证
    const urlFields = ['certificateUrl', 'newsUrl', 'externalUrl']
    urlFields.forEach(field => {
      const value = formData[field as keyof typeof formData] as string
      if (value && !isValidUrl(value)) {
        newErrors[field] = '请输入有效的URL地址'
      }
    })

    // 图片URL验证
    formData.images.forEach((url, index) => {
      if (!isValidUrl(url)) {
        newErrors[`image_${index}`] = `图片${index + 1}的URL格式无效`
      }
    })

    // 奖金金额验证
    if (formData.prizeAmount < 0) {
      newErrors.prizeAmount = '奖金金额不能为负数'
    }

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
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 添加获奖者
  const addWinner = () => {
    if (winnerInput.trim() && !formData.winners.includes(winnerInput.trim())) {
      handleInputChange('winners', [...formData.winners, winnerInput.trim()])
      setWinnerInput('')
    }
  }

  // 删除获奖者
  const removeWinner = (index: number) => {
    const newWinners = formData.winners.filter((_, i) => i !== index)
    handleInputChange('winners', newWinners)
  }

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // 删除标签
  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index)
    handleInputChange('tags', newTags)
  }

  // 添加图片
  const addImage = () => {
    if (imageInput.trim() && isValidUrl(imageInput.trim()) && !formData.images.includes(imageInput.trim())) {
      handleInputChange('images', [...formData.images, imageInput.trim()])
      setImageInput('')
    }
  }

  // 删除图片
  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    handleInputChange('images', newImages)
  }

  // 添加相关项目
  const addProject = () => {
    if (projectInput.trim() && !formData.relatedProjects.includes(projectInput.trim())) {
      handleInputChange('relatedProjects', [...formData.relatedProjects, projectInput.trim()])
      setProjectInput('')
    }
  }

  // 删除相关项目
  const removeProject = (index: number) => {
    const newProjects = formData.relatedProjects.filter((_, i) => i !== index)
    handleInputChange('relatedProjects', newProjects)
  }

  // 添加相关发表
  const addPublication = () => {
    if (publicationInput.trim() && !formData.relatedPublications.includes(publicationInput.trim())) {
      handleInputChange('relatedPublications', [...formData.relatedPublications, publicationInput.trim()])
      setPublicationInput('')
    }
  }

  // 删除相关发表
  const removePublication = (index: number) => {
    const newPublications = formData.relatedPublications.filter((_, i) => i !== index)
    handleInputChange('relatedPublications', newPublications)
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<AwardType> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        level: formData.level,
        rank: formData.rank,
        organization: formData.organization.trim(),
        organizer: formData.organizer.trim() || undefined,
        awardDate: new Date(formData.awardDate).toISOString(),
        winners: formData.winners,
        winnerIds: formData.winnerIds.length > 0 ? formData.winnerIds : undefined,
        certificateUrl: formData.certificateUrl.trim() || undefined,
        newsUrl: formData.newsUrl.trim() || undefined,
        externalUrl: formData.externalUrl.trim() || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        category: formData.category.trim() || undefined,
        prizeAmount: formData.prizeAmount > 0 ? formData.prizeAmount : undefined,
        currency: formData.prizeAmount > 0 ? formData.currency : undefined,
        criteria: formData.criteria.trim() || undefined,
        significance: formData.significance.trim() || undefined,
        impact: formData.impact.trim() || undefined,
        relatedProjects: formData.relatedProjects.length > 0 ? formData.relatedProjects : undefined,
        relatedPublications: formData.relatedPublications.length > 0 ? formData.relatedPublications : undefined,
        status: formData.status,
        visibility: formData.visibility,
        featured: formData.featured,
        notes: formData.notes.trim() || undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('提交获奖表单失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!award

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
        {/* 奖项名称 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            奖项名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入奖项名称"
            maxLength={200}
            disabled={loading || isSubmitting}
          />
          <div className="mt-1 flex justify-between">
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
            <p className="text-sm text-gray-500">{formData.name.length}/200</p>
          </div>
        </div>

        {/* 类型、级别、排名 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              奖项类型
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="academic">学术奖项</option>
              <option value="research">科研奖项</option>
              <option value="innovation">创新奖项</option>
              <option value="service">服务奖项</option>
              <option value="teaching">教学奖项</option>
              <option value="competition">竞赛奖项</option>
              <option value="honor">荣誉奖项</option>
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              奖项级别
            </label>
            <select
              id="level"
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="international">国际级</option>
              <option value="national">国家级</option>
              <option value="provincial">省级</option>
              <option value="municipal">市级</option>
              <option value="institutional">校级</option>
              <option value="departmental">院级</option>
            </select>
          </div>

          <div>
            <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-1">
              获奖等级
            </label>
            <select
              id="rank"
              value={formData.rank}
              onChange={(e) => handleInputChange('rank', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="first">一等奖</option>
              <option value="second">二等奖</option>
              <option value="third">三等奖</option>
              <option value="excellence">优秀奖</option>
              <option value="participation">参与奖</option>
              <option value="nomination">提名奖</option>
            </select>
          </div>
        </div>

        {/* 颁发机构和主办方 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
              颁发机构 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="organization"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.organization ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="如：中国科学院、IEEE"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.organization && (
              <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
            )}
          </div>

          <div>
            <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
              主办方
            </label>
            <input
              type="text"
              id="organizer"
              value={formData.organizer}
              onChange={(e) => handleInputChange('organizer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="主办方名称"
              disabled={loading || isSubmitting}
            />
          </div>
        </div>

        {/* 分类和获奖日期 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              奖项分类
            </label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：自然科学奖、技术发明奖"
              disabled={loading || isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="awardDate" className="block text-sm font-medium text-gray-700 mb-1">
              获奖日期 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="awardDate"
                value={formData.awardDate}
                onChange={(e) => handleInputChange('awardDate', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.awardDate ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.awardDate && (
              <p className="mt-1 text-sm text-red-600">{errors.awardDate}</p>
            )}
          </div>
        </div>

        {/* 状态、可见性、特色标记 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="confirmed">已确认</option>
              <option value="pending">待确认</option>
              <option value="nominated">已提名</option>
              <option value="declined">已拒绝</option>
            </select>
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
              可见性
            </label>
            <select
              id="visibility"
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="public">公开</option>
              <option value="internal">内部</option>
              <option value="private">私有</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading || isSubmitting}
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              设为特色奖项
            </label>
          </div>
        </div>
      </div>

      {/* 奖项描述 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          奖项描述
        </h3>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            奖项描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请详细描述奖项的背景、意义和获奖原因"
            maxLength={2000}
            disabled={loading || isSubmitting}
          />
          <div className="mt-1 flex justify-between">
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-sm text-gray-500">{formData.description.length}/2000</p>
          </div>
        </div>

        {/* 评选标准 */}
        <div>
          <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 mb-1">
            评选标准
          </label>
          <textarea
            id="criteria"
            value={formData.criteria}
            onChange={(e) => handleInputChange('criteria', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="描述该奖项的评选标准和要求"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 意义和影响 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="significance" className="block text-sm font-medium text-gray-700 mb-1">
              奖项意义
            </label>
            <textarea
              id="significance"
              value={formData.significance}
              onChange={(e) => handleInputChange('significance', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="描述该奖项的重要性和意义"
              disabled={loading || isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-1">
              影响和价值
            </label>
            <textarea
              id="impact"
              value={formData.impact}
              onChange={(e) => handleInputChange('impact', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="描述获奖对个人或团队的影响和价值"
              disabled={loading || isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* 获奖者信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          获奖者信息
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            获奖者 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2 mb-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={winnerInput}
                onChange={(e) => setWinnerInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWinner())}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入获奖者姓名并按回车添加"
                disabled={loading || isSubmitting}
              />
            </div>
            <button
              type="button"
              onClick={addWinner}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !winnerInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.winners.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.winners.map((winner, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {winner}
                  <button
                    type="button"
                    onClick={() => removeWinner(index)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                    disabled={loading || isSubmitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.winners && (
            <p className="mt-1 text-sm text-red-600">{errors.winners}</p>
          )}
        </div>
      </div>

      {/* 奖金信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Star className="h-5 w-5 mr-2" />
          奖金信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prizeAmount" className="block text-sm font-medium text-gray-700 mb-1">
              奖金金额
            </label>
            <input
              type="number"
              id="prizeAmount"
              value={formData.prizeAmount}
              onChange={(e) => handleInputChange('prizeAmount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.prizeAmount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={loading || isSubmitting}
            />
            {errors.prizeAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.prizeAmount}</p>
            )}
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              货币单位
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="CNY">人民币 (CNY)</option>
              <option value="USD">美元 (USD)</option>
              <option value="EUR">欧元 (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 链接和媒体 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Link className="h-5 w-5 mr-2" />
          链接和媒体
        </h3>
        
        {/* 证书链接 */}
        <div>
          <label htmlFor="certificateUrl" className="block text-sm font-medium text-gray-700 mb-1">
            证书链接
          </label>
          <input
            type="url"
            id="certificateUrl"
            value={formData.certificateUrl}
            onChange={(e) => handleInputChange('certificateUrl', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.certificateUrl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="https://example.com/certificate.pdf"
            disabled={loading || isSubmitting}
          />
          {errors.certificateUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.certificateUrl}</p>
          )}
        </div>

        {/* 新闻链接和外部链接 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="newsUrl" className="block text-sm font-medium text-gray-700 mb-1">
              新闻链接
            </label>
            <input
              type="url"
              id="newsUrl"
              value={formData.newsUrl}
              onChange={(e) => handleInputChange('newsUrl', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newsUrl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="https://example.com/news"
              disabled={loading || isSubmitting}
            />
            {errors.newsUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.newsUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="externalUrl" className="block text-sm font-medium text-gray-700 mb-1">
              外部链接
            </label>
            <input
              type="url"
              id="externalUrl"
              value={formData.externalUrl}
              onChange={(e) => handleInputChange('externalUrl', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.externalUrl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="https://example.com/award"
              disabled={loading || isSubmitting}
            />
            {errors.externalUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.externalUrl}</p>
            )}
          </div>
        </div>

        {/* 图片 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            相关图片
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入图片URL并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !imageInput.trim() || !isValidUrl(imageInput.trim())}
            >
              添加
            </button>
          </div>
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-16 object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM4LjY4NjI5IDE2IDYgMTMuMzEzNyA2IDEwQzYgNi42ODYyOSA4LjY4NjI5IDQgMTIgNEMxNS4zMTM3IDQgMTggNi42ODYyOSAxOCAxMEMxOCAxMy4zMTM3IDE1LjMxMzcgMTYgMTIgMTZaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading || isSubmitting}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 标签和分类 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          标签和分类
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标签
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入标签并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !tagInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-green-400 hover:text-green-600"
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

      {/* 相关信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Link className="h-5 w-5 mr-2" />
          相关信息
        </h3>
        
        {/* 相关项目 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            相关项目
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProject())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入相关项目并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addProject}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !projectInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.relatedProjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.relatedProjects.map((project, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {project}
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-purple-400 hover:text-purple-600"
                    disabled={loading || isSubmitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 相关发表 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            相关发表
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={publicationInput}
              onChange={(e) => setPublicationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPublication())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入相关发表并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addPublication}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !publicationInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.relatedPublications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.relatedPublications.map((publication, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                >
                  {publication}
                  <button
                    type="button"
                    onClick={() => removePublication(index)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-orange-400 hover:text-orange-600"
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

      {/* 备注 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          备注信息
        </h3>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            备注
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="其他需要说明的信息"
            disabled={loading || isSubmitting}
          />
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
          {isEditing ? '更新获奖' : '添加获奖'}
        </button>
      </div>
    </form>
  )
}

export default AwardForm