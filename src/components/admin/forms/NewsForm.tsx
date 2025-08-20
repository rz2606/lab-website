import React, { useState, useEffect } from 'react'
import { Newspaper, Calendar, Users, Tag, Link, FileText, Eye, Clock } from 'lucide-react'
import type { News } from '@/types/admin'
import LoadingSpinner from '../common/LoadingSpinner'

interface NewsFormProps {
  news?: News | null
  onSubmit: (newsData: Partial<News>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const NewsForm: React.FC<NewsFormProps> = ({
  news,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    type: 'general' as 'general' | 'research' | 'event' | 'announcement' | 'achievement' | 'collaboration',
    author: '',
    authorId: '',
    tags: [] as string[],
    featuredImage: '',
    images: [] as string[],
    externalUrl: '',
    source: '',
    status: 'draft' as 'draft' | 'published' | 'archived' | 'scheduled',
    visibility: 'public' as 'public' | 'private' | 'internal',
    featured: false,
    urgent: false,
    allowComments: true,
    viewCount: 0,
    publishDate: '',
    expiryDate: '',
    location: '',
    eventDate: '',
    contactInfo: '',
    relatedLinks: [] as { title: string; url: string }[]
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  // 初始化表单数据
  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || '',
        content: news.content || '',
        summary: news.summary || '',
        type: news.type || 'general',
        author: news.author || '',
        authorId: news.authorId || '',
        tags: news.tags || [],
        featuredImage: news.featuredImage || '',
        images: news.images || [],
        externalUrl: news.externalUrl || '',
        source: news.source || '',
        status: news.status || 'draft',
        visibility: news.visibility || 'public',
        featured: news.featured || false,
        urgent: news.urgent || false,
        allowComments: news.allowComments !== false,
        viewCount: news.viewCount || 0,
        publishDate: news.publishDate ? new Date(news.publishDate).toISOString().split('T')[0] : '',
        expiryDate: news.expiryDate ? new Date(news.expiryDate).toISOString().split('T')[0] : '',
        location: news.location || '',
        eventDate: news.eventDate ? new Date(news.eventDate).toISOString().split('T')[0] : '',
        contactInfo: news.contactInfo || '',
        relatedLinks: news.relatedLinks || []
      })
    } else {
      setFormData({
        title: '',
        content: '',
        summary: '',
        type: 'general',
        author: '',
        authorId: '',
        tags: [],
        featuredImage: '',
        images: [],
        externalUrl: '',
        source: '',
        status: 'draft',
        visibility: 'public',
        featured: false,
        urgent: false,
        allowComments: true,
        viewCount: 0,
        publishDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        location: '',
        eventDate: '',
        contactInfo: '',
        relatedLinks: []
      })
    }
    setErrors({})
  }, [news])

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 标题验证
    if (!formData.title.trim()) {
      newErrors.title = '新闻标题不能为空'
    } else if (formData.title.length < 5) {
      newErrors.title = '新闻标题至少需要5个字符'
    } else if (formData.title.length > 200) {
      newErrors.title = '新闻标题不能超过200个字符'
    }

    // 内容验证
    if (!formData.content.trim()) {
      newErrors.content = '新闻内容不能为空'
    } else if (formData.content.length < 50) {
      newErrors.content = '新闻内容至少需要50个字符'
    }

    // 摘要验证
    if (!formData.summary.trim()) {
      newErrors.summary = '新闻摘要不能为空'
    } else if (formData.summary.length < 20) {
      newErrors.summary = '新闻摘要至少需要20个字符'
    } else if (formData.summary.length > 500) {
      newErrors.summary = '新闻摘要不能超过500个字符'
    }

    // 作者验证
    if (!formData.author.trim()) {
      newErrors.author = '作者不能为空'
    }

    // URL验证
    const urlFields = ['featuredImage', 'externalUrl']
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

    // 相关链接验证
    formData.relatedLinks.forEach((link, index) => {
      if (!link.title.trim()) {
        newErrors[`link_title_${index}`] = `链接${index + 1}的标题不能为空`
      }
      if (!isValidUrl(link.url)) {
        newErrors[`link_url_${index}`] = `链接${index + 1}的URL格式无效`
      }
    })

    // 日期验证
    if (formData.publishDate && formData.expiryDate) {
      const publishDate = new Date(formData.publishDate)
      const expiryDate = new Date(formData.expiryDate)
      if (expiryDate <= publishDate) {
        newErrors.expiryDate = '过期时间必须晚于发布时间'
      }
    }

    if (formData.eventDate && formData.publishDate) {
      const eventDate = new Date(formData.eventDate)
      const publishDate = new Date(formData.publishDate)
      if (eventDate < publishDate) {
        newErrors.eventDate = '活动时间不能早于发布时间'
      }
    }

    // 统计数据验证
    if (formData.viewCount < 0) {
      newErrors.viewCount = '浏览次数不能为负数'
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

  // 添加相关链接
  const addRelatedLink = () => {
    if (linkTitle.trim() && linkUrl.trim() && isValidUrl(linkUrl.trim())) {
      const newLink = { title: linkTitle.trim(), url: linkUrl.trim() }
      handleInputChange('relatedLinks', [...formData.relatedLinks, newLink])
      setLinkTitle('')
      setLinkUrl('')
    }
  }

  // 删除相关链接
  const removeRelatedLink = (index: number) => {
    const newLinks = formData.relatedLinks.filter((_, i) => i !== index)
    handleInputChange('relatedLinks', newLinks)
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<News> = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        summary: formData.summary.trim(),
        type: formData.type,
        author: formData.author.trim(),
        authorId: formData.authorId.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        featuredImage: formData.featuredImage.trim() || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        externalUrl: formData.externalUrl.trim() || undefined,
        source: formData.source.trim() || undefined,
        status: formData.status,
        visibility: formData.visibility,
        featured: formData.featured,
        urgent: formData.urgent,
        allowComments: formData.allowComments,
        viewCount: formData.viewCount,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
        location: formData.location.trim() || undefined,
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : undefined,
        contactInfo: formData.contactInfo.trim() || undefined,
        relatedLinks: formData.relatedLinks.length > 0 ? formData.relatedLinks : undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('提交新闻表单失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!news

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Newspaper className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
        {/* 新闻标题 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            新闻标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入新闻标题"
            maxLength={200}
            disabled={loading || isSubmitting}
          />
          <div className="mt-1 flex justify-between">
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <p className="text-sm text-gray-500">{formData.title.length}/200</p>
          </div>
        </div>

        {/* 类型、状态、可见性 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              新闻类型
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="general">一般新闻</option>
              <option value="research">研究动态</option>
              <option value="event">活动通知</option>
              <option value="announcement">公告通知</option>
              <option value="achievement">成果发布</option>
              <option value="collaboration">合作交流</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              发布状态
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="scheduled">定时发布</option>
              <option value="archived">已归档</option>
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
        </div>

        {/* 作者和来源 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              作者 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.author ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="请输入作者姓名"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author}</p>
            )}
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              新闻来源
            </label>
            <input
              type="text"
              id="source"
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：实验室官网、新华社"
              disabled={loading || isSubmitting}
            />
          </div>
        </div>

        {/* 特殊标记 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading || isSubmitting}
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              设为特色新闻
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="urgent"
              checked={formData.urgent}
              onChange={(e) => handleInputChange('urgent', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              disabled={loading || isSubmitting}
            />
            <label htmlFor="urgent" className="ml-2 block text-sm text-gray-900">
              紧急新闻
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowComments"
              checked={formData.allowComments}
              onChange={(e) => handleInputChange('allowComments', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading || isSubmitting}
            />
            <label htmlFor="allowComments" className="ml-2 block text-sm text-gray-900">
              允许评论
            </label>
          </div>
        </div>
      </div>

      {/* 内容信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          内容信息
        </h3>
        
        {/* 新闻摘要 */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            新闻摘要 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.summary ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入新闻摘要（20-500字符）"
            maxLength={500}
            disabled={loading || isSubmitting}
          />
          <div className="mt-1 flex justify-between">
            {errors.summary && (
              <p className="text-sm text-red-600">{errors.summary}</p>
            )}
            <p className="text-sm text-gray-500">{formData.summary.length}/500</p>
          </div>
        </div>

        {/* 新闻内容 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            新闻内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={8}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入新闻详细内容"
            disabled={loading || isSubmitting}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标签
          </label>
          <div className="flex space-x-2 mb-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入标签并按回车添加"
                disabled={loading || isSubmitting}
              />
            </div>
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
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
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

      {/* 媒体信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          媒体信息
        </h3>
        
        {/* 特色图片 */}
        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
            特色图片
          </label>
          <input
            type="url"
            id="featuredImage"
            value={formData.featuredImage}
            onChange={(e) => handleInputChange('featuredImage', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.featuredImage ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="https://example.com/image.jpg"
            disabled={loading || isSubmitting}
          />
          {errors.featuredImage && (
            <p className="mt-1 text-sm text-red-600">{errors.featuredImage}</p>
          )}
          {formData.featuredImage && isValidUrl(formData.featuredImage) && (
            <div className="mt-2">
              <img
                src={formData.featuredImage}
                alt="特色图片预览"
                className="w-32 h-20 object-cover rounded-md border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* 其他图片 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            其他图片
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

        {/* 外部链接 */}
        <div>
          <label htmlFor="externalUrl" className="block text-sm font-medium text-gray-700 mb-1">
            外部链接
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="url"
              id="externalUrl"
              value={formData.externalUrl}
              onChange={(e) => handleInputChange('externalUrl', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.externalUrl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="https://example.com/news"
              disabled={loading || isSubmitting}
            />
          </div>
          {errors.externalUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.externalUrl}</p>
          )}
        </div>
      </div>

      {/* 时间和地点信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          时间和地点信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 发布时间 */}
          <div>
            <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
              发布时间
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="publishDate"
                value={formData.publishDate}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || isSubmitting}
              />
            </div>
          </div>

          {/* 过期时间 */}
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              过期时间
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiryDate ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>

          {/* 活动时间 */}
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
              活动时间
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="eventDate"
                value={formData.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.eventDate ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.eventDate && (
              <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>
            )}
          </div>

          {/* 浏览次数 */}
          <div>
            <label htmlFor="viewCount" className="block text-sm font-medium text-gray-700 mb-1">
              浏览次数
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                id="viewCount"
                value={formData.viewCount}
                onChange={(e) => handleInputChange('viewCount', parseInt(e.target.value) || 0)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.viewCount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                min="0"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.viewCount && (
              <p className="mt-1 text-sm text-red-600">{errors.viewCount}</p>
            )}
          </div>
        </div>

        {/* 地点和联系信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              活动地点
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：北京大学英杰交流中心"
              disabled={loading || isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-1">
              联系信息
            </label>
            <input
              type="text"
              id="contactInfo"
              value={formData.contactInfo}
              onChange={(e) => handleInputChange('contactInfo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：联系人：张三，电话：010-12345678"
              disabled={loading || isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* 相关链接 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Link className="h-5 w-5 mr-2" />
          相关链接
        </h3>
        
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="链接标题"
              disabled={loading || isSubmitting}
            />
            <div className="flex space-x-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="链接URL"
                disabled={loading || isSubmitting}
              />
              <button
                type="button"
                onClick={addRelatedLink}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading || isSubmitting || !linkTitle.trim() || !linkUrl.trim() || !isValidUrl(linkUrl.trim())}
              >
                添加
              </button>
            </div>
          </div>
          
          {formData.relatedLinks.length > 0 && (
            <div className="space-y-2">
              {formData.relatedLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{link.title}</div>
                    <div className="text-sm text-blue-600 hover:text-blue-800">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.url}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRelatedLink(index)}
                    className="ml-2 text-red-400 hover:text-red-600"
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
          {isEditing ? '更新新闻' : '添加新闻'}
        </button>
      </div>
    </form>
  )
}

export default NewsForm