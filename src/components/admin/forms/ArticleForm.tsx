import React, { useState, useEffect } from 'react'
import { FileText, Calendar, Users, Tag, Link, Eye, Clock, Image, BookOpen } from 'lucide-react'
import type { Article } from '@/types/admin'
import LoadingSpinner from '../common/LoadingSpinner'

interface ArticleFormProps {
  article?: Article | null
  onSubmit: (articleData: Partial<Article>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    type: 'research' as 'research' | 'tutorial' | 'review' | 'opinion' | 'news' | 'technical',
    authors: [] as string[],
    authorIds: [] as string[],
    tags: [] as string[],
    category: '',
    featuredImage: '',
    images: [] as string[],
    externalUrl: '',
    doi: '',
    status: 'draft' as 'draft' | 'published' | 'archived' | 'under_review',
    visibility: 'public' as 'public' | 'private' | 'internal',
    featured: false,
    allowComments: true,
    viewCount: 0,
    readingTime: 0,
    publishDate: '',
    lastModified: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [] as string[],
    relatedArticles: [] as string[],
    references: [] as { title: string; url: string; authors?: string }[],
    tableOfContents: [] as { level: number; title: string; anchor: string }[]
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authorInput, setAuthorInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [seoKeywordInput, setSeoKeywordInput] = useState('')
  const [referenceTitle, setReferenceTitle] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [referenceAuthors, setReferenceAuthors] = useState('')
  const [tocTitle, setTocTitle] = useState('')
  const [tocLevel, setTocLevel] = useState(1)

  // 初始化表单数据
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        summary: article.summary || '',
        type: article.type || 'research',
        authors: article.authors || [],
        authorIds: article.authorIds || [],
        tags: article.tags || [],
        category: article.category || '',
        featuredImage: article.featuredImage || '',
        images: article.images || [],
        externalUrl: article.externalUrl || '',
        doi: article.doi || '',
        status: article.status || 'draft',
        visibility: article.visibility || 'public',
        featured: article.featured || false,
        allowComments: article.allowComments !== false,
        viewCount: article.viewCount || 0,
        readingTime: article.readingTime || 0,
        publishDate: article.publishDate ? new Date(article.publishDate).toISOString().split('T')[0] : '',
        lastModified: article.lastModified ? new Date(article.lastModified).toISOString().split('T')[0] : '',
        seoTitle: article.seoTitle || '',
        seoDescription: article.seoDescription || '',
        seoKeywords: article.seoKeywords || [],
        relatedArticles: article.relatedArticles || [],
        references: article.references || [],
        tableOfContents: article.tableOfContents || []
      })
    } else {
      setFormData({
        title: '',
        content: '',
        summary: '',
        type: 'research',
        authors: [],
        authorIds: [],
        tags: [],
        category: '',
        featuredImage: '',
        images: [],
        externalUrl: '',
        doi: '',
        status: 'draft',
        visibility: 'public',
        featured: false,
        allowComments: true,
        viewCount: 0,
        readingTime: 0,
        publishDate: new Date().toISOString().split('T')[0],
        lastModified: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: [],
        relatedArticles: [],
        references: [],
        tableOfContents: []
      })
    }
    setErrors({})
  }, [article])

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 标题验证
    if (!formData.title.trim()) {
      newErrors.title = '文章标题不能为空'
    } else if (formData.title.length < 5) {
      newErrors.title = '文章标题至少需要5个字符'
    } else if (formData.title.length > 200) {
      newErrors.title = '文章标题不能超过200个字符'
    }

    // 内容验证
    if (!formData.content.trim()) {
      newErrors.content = '文章内容不能为空'
    } else if (formData.content.length < 100) {
      newErrors.content = '文章内容至少需要100个字符'
    }

    // 摘要验证
    if (!formData.summary.trim()) {
      newErrors.summary = '文章摘要不能为空'
    } else if (formData.summary.length < 50) {
      newErrors.summary = '文章摘要至少需要50个字符'
    } else if (formData.summary.length > 1000) {
      newErrors.summary = '文章摘要不能超过1000个字符'
    }

    // 作者验证
    if (formData.authors.length === 0) {
      newErrors.authors = '至少需要一个作者'
    }

    // 分类验证
    if (!formData.category.trim()) {
      newErrors.category = '文章分类不能为空'
    }

    // URL验证
    const urlFields = ['featuredImage', 'externalUrl']
    urlFields.forEach(field => {
      const value = formData[field as keyof typeof formData] as string
      if (value && !isValidUrl(value)) {
        newErrors[field] = '请输入有效的URL地址'
      }
    })

    // DOI验证
    if (formData.doi && !isValidDoi(formData.doi)) {
      newErrors.doi = '请输入有效的DOI格式'
    }

    // 图片URL验证
    formData.images.forEach((url, index) => {
      if (!isValidUrl(url)) {
        newErrors[`image_${index}`] = `图片${index + 1}的URL格式无效`
      }
    })

    // 参考文献验证
    formData.references.forEach((ref, index) => {
      if (!ref.title.trim()) {
        newErrors[`ref_title_${index}`] = `参考文献${index + 1}的标题不能为空`
      }
      if (!isValidUrl(ref.url)) {
        newErrors[`ref_url_${index}`] = `参考文献${index + 1}的URL格式无效`
      }
    })

    // 统计数据验证
    if (formData.viewCount < 0) {
      newErrors.viewCount = '浏览次数不能为负数'
    }
    if (formData.readingTime < 0) {
      newErrors.readingTime = '阅读时间不能为负数'
    }

    // SEO验证
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      newErrors.seoTitle = 'SEO标题不能超过60个字符'
    }
    if (formData.seoDescription && formData.seoDescription.length > 160) {
      newErrors.seoDescription = 'SEO描述不能超过160个字符'
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

  // DOI验证函数
  const isValidDoi = (doi: string) => {
    const doiPattern = /^10\.\d{4,}\/.+/
    return doiPattern.test(doi)
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 添加作者
  const addAuthor = () => {
    if (authorInput.trim() && !formData.authors.includes(authorInput.trim())) {
      handleInputChange('authors', [...formData.authors, authorInput.trim()])
      setAuthorInput('')
    }
  }

  // 删除作者
  const removeAuthor = (index: number) => {
    const newAuthors = formData.authors.filter((_, i) => i !== index)
    handleInputChange('authors', newAuthors)
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

  // 添加SEO关键词
  const addSeoKeyword = () => {
    if (seoKeywordInput.trim() && !formData.seoKeywords.includes(seoKeywordInput.trim())) {
      handleInputChange('seoKeywords', [...formData.seoKeywords, seoKeywordInput.trim()])
      setSeoKeywordInput('')
    }
  }

  // 删除SEO关键词
  const removeSeoKeyword = (index: number) => {
    const newKeywords = formData.seoKeywords.filter((_, i) => i !== index)
    handleInputChange('seoKeywords', newKeywords)
  }

  // 添加参考文献
  const addReference = () => {
    if (referenceTitle.trim() && referenceUrl.trim() && isValidUrl(referenceUrl.trim())) {
      const newRef = {
        title: referenceTitle.trim(),
        url: referenceUrl.trim(),
        authors: referenceAuthors.trim() || undefined
      }
      handleInputChange('references', [...formData.references, newRef])
      setReferenceTitle('')
      setReferenceUrl('')
      setReferenceAuthors('')
    }
  }

  // 删除参考文献
  const removeReference = (index: number) => {
    const newReferences = formData.references.filter((_, i) => i !== index)
    handleInputChange('references', newReferences)
  }

  // 添加目录项
  const addTocItem = () => {
    if (tocTitle.trim()) {
      const anchor = tocTitle.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const newTocItem = {
        level: tocLevel,
        title: tocTitle.trim(),
        anchor
      }
      handleInputChange('tableOfContents', [...formData.tableOfContents, newTocItem])
      setTocTitle('')
    }
  }

  // 删除目录项
  const removeTocItem = (index: number) => {
    const newToc = formData.tableOfContents.filter((_, i) => i !== index)
    handleInputChange('tableOfContents', newToc)
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<Article> = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        summary: formData.summary.trim(),
        type: formData.type,
        authors: formData.authors,
        authorIds: formData.authorIds.length > 0 ? formData.authorIds : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        category: formData.category.trim(),
        featuredImage: formData.featuredImage.trim() || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        externalUrl: formData.externalUrl.trim() || undefined,
        doi: formData.doi.trim() || undefined,
        status: formData.status,
        visibility: formData.visibility,
        featured: formData.featured,
        allowComments: formData.allowComments,
        viewCount: formData.viewCount,
        readingTime: formData.readingTime,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined,
        lastModified: new Date().toISOString(),
        seoTitle: formData.seoTitle.trim() || undefined,
        seoDescription: formData.seoDescription.trim() || undefined,
        seoKeywords: formData.seoKeywords.length > 0 ? formData.seoKeywords : undefined,
        relatedArticles: formData.relatedArticles.length > 0 ? formData.relatedArticles : undefined,
        references: formData.references.length > 0 ? formData.references : undefined,
        tableOfContents: formData.tableOfContents.length > 0 ? formData.tableOfContents : undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('提交文章表单失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!article

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
        {/* 文章标题 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            文章标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入文章标题"
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
              文章类型
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="research">研究论文</option>
              <option value="tutorial">教程指南</option>
              <option value="review">综述评论</option>
              <option value="opinion">观点评述</option>
              <option value="news">新闻报道</option>
              <option value="technical">技术文档</option>
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
              <option value="under_review">审核中</option>
              <option value="published">已发布</option>
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

        {/* 分类和DOI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              文章分类 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="如：机器学习、数据挖掘"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-1">
              DOI
            </label>
            <input
              type="text"
              id="doi"
              value={formData.doi}
              onChange={(e) => handleInputChange('doi', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.doi ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="10.1000/182"
              disabled={loading || isSubmitting}
            />
            {errors.doi && (
              <p className="mt-1 text-sm text-red-600">{errors.doi}</p>
            )}
          </div>
        </div>

        {/* 特殊标记 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              设为特色文章
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

      {/* 作者信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          作者信息
        </h3>
        
        {/* 作者 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            作者 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2 mb-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAuthor())}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入作者姓名并按回车添加"
                disabled={loading || isSubmitting}
              />
            </div>
            <button
              type="button"
              onClick={addAuthor}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !authorInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.authors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.authors.map((author, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {author}
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                    disabled={loading || isSubmitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.authors && (
            <p className="mt-1 text-sm text-red-600">{errors.authors}</p>
          )}
        </div>
      </div>

      {/* 内容信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          内容信息
        </h3>
        
        {/* 文章摘要 */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            文章摘要 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.summary ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入文章摘要（50-1000字符）"
            maxLength={1000}
            disabled={loading || isSubmitting}
          />
          <div className="mt-1 flex justify-between">
            {errors.summary && (
              <p className="text-sm text-red-600">{errors.summary}</p>
            )}
            <p className="text-sm text-gray-500">{formData.summary.length}/1000</p>
          </div>
        </div>

        {/* 文章内容 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            文章内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={12}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入文章详细内容"
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

      {/* 媒体信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Image className="h-5 w-5 mr-2" />
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
              placeholder="https://example.com/article"
              disabled={loading || isSubmitting}
            />
          </div>
          {errors.externalUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.externalUrl}</p>
          )}
        </div>
      </div>

      {/* 统计和时间信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          统计和时间信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* 阅读时间 */}
          <div>
            <label htmlFor="readingTime" className="block text-sm font-medium text-gray-700 mb-1">
              阅读时间（分钟）
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                id="readingTime"
                value={formData.readingTime}
                onChange={(e) => handleInputChange('readingTime', parseInt(e.target.value) || 0)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.readingTime ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                min="0"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.readingTime && (
              <p className="mt-1 text-sm text-red-600">{errors.readingTime}</p>
            )}
          </div>

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
        </div>
      </div>

      {/* SEO信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          SEO信息
        </h3>
        
        {/* SEO标题 */}
        <div>
          <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
            SEO标题
          </label>
          <input
            type="text"
            id="seoTitle"
            value={formData.seoTitle}
            onChange={(e) => handleInputChange('seoTitle', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.seoTitle ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="SEO优化标题（建议60字符以内）"
            maxLength={60}
            disabled={loading || isSubmitting}
          />
          <div className="mt-1 flex justify-between">
            {errors.seoTitle && (
              <p className="text-sm text-red-600">{errors.seoTitle}</p>
            )}
            <p className="text-sm text-gray-500">{formData.seoTitle.length}/60</p>
          </div>
        </div>

        {/* SEO描述 */}
        <div>
          <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
            SEO描述
          </label>
          <textarea
            id="seoDescription"
            value={formData.seoDescription}
            onChange={(e) => handleInputChange('seoDescription', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.seoDescription ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="SEO描述（建议160字符以内）"
            maxLength={160}
            disabled={loading || isSubmitting}
          />
          <div className="mt-1 flex justify-between">
            {errors.seoDescription && (
              <p className="text-sm text-red-600">{errors.seoDescription}</p>
            )}
            <p className="text-sm text-gray-500">{formData.seoDescription.length}/160</p>
          </div>
        </div>

        {/* SEO关键词 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO关键词
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={seoKeywordInput}
              onChange={(e) => setSeoKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSeoKeyword())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入SEO关键词并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addSeoKeyword}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !seoKeywordInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.seoKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.seoKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeSeoKeyword(index)}
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
      </div>

      {/* 参考文献 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Link className="h-5 w-5 mr-2" />
          参考文献
        </h3>
        
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              value={referenceTitle}
              onChange={(e) => setReferenceTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="文献标题"
              disabled={loading || isSubmitting}
            />
            <input
              type="url"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="文献URL"
              disabled={loading || isSubmitting}
            />
            <div className="flex space-x-2">
              <input
                type="text"
                value={referenceAuthors}
                onChange={(e) => setReferenceAuthors(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="作者（可选）"
                disabled={loading || isSubmitting}
              />
              <button
                type="button"
                onClick={addReference}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading || isSubmitting || !referenceTitle.trim() || !referenceUrl.trim() || !isValidUrl(referenceUrl.trim())}
              >
                添加
              </button>
            </div>
          </div>
          
          {formData.references.length > 0 && (
            <div className="space-y-2">
              {formData.references.map((ref, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{ref.title}</div>
                    {ref.authors && (
                      <div className="text-sm text-gray-600">作者：{ref.authors}</div>
                    )}
                    <div className="text-sm text-blue-600 hover:text-blue-800">
                      <a href={ref.url} target="_blank" rel="noopener noreferrer">
                        {ref.url}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReference(index)}
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

      {/* 目录 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          目录
        </h3>
        
        <div className="space-y-2">
          <div className="flex space-x-2">
            <select
              value={tocLevel}
              onChange={(e) => setTocLevel(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
            <input
              type="text"
              value={tocTitle}
              onChange={(e) => setTocTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="目录标题"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addTocItem}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !tocTitle.trim()}
            >
              添加
            </button>
          </div>
          
          {formData.tableOfContents.length > 0 && (
            <div className="space-y-1">
              {formData.tableOfContents.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  style={{ paddingLeft: `${item.level * 12 + 8}px` }}
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      H{item.level} {item.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">#{item.anchor}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTocItem(index)}
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
          {isEditing ? '更新文章' : '添加文章'}
        </button>
      </div>
    </form>
  )
}

export default ArticleForm