import React, { useState, useEffect } from 'react'
import { BookOpen, Calendar, Users, Tag, Link, FileText } from 'lucide-react'
import type { Publication } from '@/types/admin'
import LoadingSpinner from '../common/LoadingSpinner'

interface PublicationFormProps {
  publication?: Publication | null
  onSubmit: (publicationData: Partial<Publication>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const PublicationForm: React.FC<PublicationFormProps> = ({
  publication,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    authors: [] as string[],
    journal: '',
    conference: '',
    year: new Date().getFullYear(),
    volume: '',
    issue: '',
    pages: '',
    publisher: '',
    doi: '',
    url: '',
    abstract: '',
    keywords: [] as string[],
    type: 'journal' as 'journal' | 'conference' | 'book' | 'patent' | 'thesis',
    status: 'published' as 'published' | 'accepted' | 'submitted' | 'draft',
    featured: false,
    citationCount: 0,
    impactFactor: '',
    quartile: '' as '' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authorInput, setAuthorInput] = useState('')
  const [keywordInput, setKeywordInput] = useState('')

  // 初始化表单数据
  useEffect(() => {
    if (publication) {
      setFormData({
        title: publication.title || '',
        authors: publication.authors || [],
        journal: publication.journal || '',
        conference: publication.conference || '',
        year: publication.year || new Date().getFullYear(),
        volume: publication.volume || '',
        issue: publication.issue || '',
        pages: publication.pages || '',
        publisher: publication.publisher || '',
        doi: publication.doi || '',
        url: publication.url || '',
        abstract: publication.abstract || '',
        keywords: publication.keywords || [],
        type: publication.type || 'journal',
        status: publication.status || 'published',
        featured: publication.featured || false,
        citationCount: publication.citationCount || 0,
        impactFactor: publication.impactFactor || '',
        quartile: publication.quartile || ''
      })
    } else {
      setFormData({
        title: '',
        authors: [],
        journal: '',
        conference: '',
        year: new Date().getFullYear(),
        volume: '',
        issue: '',
        pages: '',
        publisher: '',
        doi: '',
        url: '',
        abstract: '',
        keywords: [],
        type: 'journal',
        status: 'published',
        featured: false,
        citationCount: 0,
        impactFactor: '',
        quartile: ''
      })
    }
    setErrors({})
  }, [publication])

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 标题验证
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空'
    }

    // 作者验证
    if (formData.authors.length === 0) {
      newErrors.authors = '至少需要一个作者'
    }

    // 年份验证
    const currentYear = new Date().getFullYear()
    if (formData.year < 1900 || formData.year > currentYear + 5) {
      newErrors.year = `年份应在1900到${currentYear + 5}之间`
    }

    // 根据类型验证必填字段
    if (formData.type === 'journal' && !formData.journal.trim()) {
      newErrors.journal = '期刊名称不能为空'
    }
    if (formData.type === 'conference' && !formData.conference.trim()) {
      newErrors.conference = '会议名称不能为空'
    }
    if ((formData.type === 'book' || formData.type === 'thesis') && !formData.publisher.trim()) {
      newErrors.publisher = '出版社不能为空'
    }

    // DOI验证
    if (formData.doi && !/^10\.\d{4,}\/.+/.test(formData.doi)) {
      newErrors.doi = '请输入有效的DOI格式（如：10.1000/example）'
    }

    // URL验证
    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = '请输入有效的URL地址'
    }

    // 影响因子验证
    if (formData.impactFactor && (isNaN(Number(formData.impactFactor)) || Number(formData.impactFactor) < 0)) {
      newErrors.impactFactor = '影响因子必须是非负数'
    }

    // 引用次数验证
    if (formData.citationCount < 0) {
      newErrors.citationCount = '引用次数不能为负数'
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

  // 添加关键词
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      handleInputChange('keywords', [...formData.keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  // 删除关键词
  const removeKeyword = (index: number) => {
    const newKeywords = formData.keywords.filter((_, i) => i !== index)
    handleInputChange('keywords', newKeywords)
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<Publication> = {
        title: formData.title.trim(),
        authors: formData.authors,
        journal: formData.journal.trim() || undefined,
        conference: formData.conference.trim() || undefined,
        year: formData.year,
        volume: formData.volume.trim() || undefined,
        issue: formData.issue.trim() || undefined,
        pages: formData.pages.trim() || undefined,
        publisher: formData.publisher.trim() || undefined,
        doi: formData.doi.trim() || undefined,
        url: formData.url.trim() || undefined,
        abstract: formData.abstract.trim() || undefined,
        keywords: formData.keywords.length > 0 ? formData.keywords : undefined,
        type: formData.type,
        status: formData.status,
        featured: formData.featured,
        citationCount: formData.citationCount,
        impactFactor: formData.impactFactor ? Number(formData.impactFactor) : undefined,
        quartile: formData.quartile || undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('提交发表成果表单失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!publication

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
        {/* 标题 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入发表成果标题"
            disabled={loading || isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* 类型和状态 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              类型
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="journal">期刊论文</option>
              <option value="conference">会议论文</option>
              <option value="book">书籍</option>
              <option value="patent">专利</option>
              <option value="thesis">学位论文</option>
            </select>
          </div>

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
              <option value="published">已发表</option>
              <option value="accepted">已接收</option>
              <option value="submitted">已投稿</option>
              <option value="draft">草稿</option>
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              年份 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.year ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                min="1900"
                max={new Date().getFullYear() + 5}
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year}</p>
            )}
          </div>
        </div>

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

      {/* 发表信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          发表信息
        </h3>
        
        {/* 期刊/会议名称 */}
        {formData.type === 'journal' && (
          <div>
            <label htmlFor="journal" className="block text-sm font-medium text-gray-700 mb-1">
              期刊名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="journal"
              value={formData.journal}
              onChange={(e) => handleInputChange('journal', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.journal ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="请输入期刊名称"
              disabled={loading || isSubmitting}
            />
            {errors.journal && (
              <p className="mt-1 text-sm text-red-600">{errors.journal}</p>
            )}
          </div>
        )}

        {formData.type === 'conference' && (
          <div>
            <label htmlFor="conference" className="block text-sm font-medium text-gray-700 mb-1">
              会议名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="conference"
              value={formData.conference}
              onChange={(e) => handleInputChange('conference', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.conference ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="请输入会议名称"
              disabled={loading || isSubmitting}
            />
            {errors.conference && (
              <p className="mt-1 text-sm text-red-600">{errors.conference}</p>
            )}
          </div>
        )}

        {(formData.type === 'book' || formData.type === 'thesis') && (
          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-1">
              出版社 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="publisher"
              value={formData.publisher}
              onChange={(e) => handleInputChange('publisher', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.publisher ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="请输入出版社名称"
              disabled={loading || isSubmitting}
            />
            {errors.publisher && (
              <p className="mt-1 text-sm text-red-600">{errors.publisher}</p>
            )}
          </div>
        )}

        {/* 卷期页码 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
              卷号
            </label>
            <input
              type="text"
              id="volume"
              value={formData.volume}
              onChange={(e) => handleInputChange('volume', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="卷号"
              disabled={loading || isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
              期号
            </label>
            <input
              type="text"
              id="issue"
              value={formData.issue}
              onChange={(e) => handleInputChange('issue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="期号"
              disabled={loading || isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">
              页码
            </label>
            <input
              type="text"
              id="pages"
              value={formData.pages}
              onChange={(e) => handleInputChange('pages', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：1-10"
              disabled={loading || isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* 链接和标识 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Link className="h-5 w-5 mr-2" />
          链接和标识
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DOI */}
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
              placeholder="如：10.1000/example"
              disabled={loading || isSubmitting}
            />
            {errors.doi && (
              <p className="mt-1 text-sm text-red-600">{errors.doi}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              链接地址
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.url ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="https://example.com"
              disabled={loading || isSubmitting}
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url}</p>
            )}
          </div>
        </div>
      </div>

      {/* 质量指标 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          质量指标
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 引用次数 */}
          <div>
            <label htmlFor="citationCount" className="block text-sm font-medium text-gray-700 mb-1">
              引用次数
            </label>
            <input
              type="number"
              id="citationCount"
              value={formData.citationCount}
              onChange={(e) => handleInputChange('citationCount', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.citationCount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              min="0"
              disabled={loading || isSubmitting}
            />
            {errors.citationCount && (
              <p className="mt-1 text-sm text-red-600">{errors.citationCount}</p>
            )}
          </div>

          {/* 影响因子 */}
          <div>
            <label htmlFor="impactFactor" className="block text-sm font-medium text-gray-700 mb-1">
              影响因子
            </label>
            <input
              type="number"
              id="impactFactor"
              value={formData.impactFactor}
              onChange={(e) => handleInputChange('impactFactor', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.impactFactor ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              step="0.001"
              min="0"
              placeholder="如：3.456"
              disabled={loading || isSubmitting}
            />
            {errors.impactFactor && (
              <p className="mt-1 text-sm text-red-600">{errors.impactFactor}</p>
            )}
          </div>

          {/* 分区 */}
          <div>
            <label htmlFor="quartile" className="block text-sm font-medium text-gray-700 mb-1">
              JCR分区
            </label>
            <select
              id="quartile"
              value={formData.quartile}
              onChange={(e) => handleInputChange('quartile', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || isSubmitting}
            >
              <option value="">请选择</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>
        </div>
      </div>

      {/* 摘要和关键词 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          详细信息
        </h3>
        
        {/* 摘要 */}
        <div>
          <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-1">
            摘要
          </label>
          <textarea
            id="abstract"
            value={formData.abstract}
            onChange={(e) => handleInputChange('abstract', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入摘要"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 关键词 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            关键词
          </label>
          <div className="flex space-x-2 mb-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入关键词并按回车添加"
                disabled={loading || isSubmitting}
              />
            </div>
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !keywordInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
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

        {/* 特色标记 */}
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
            设为特色成果
          </label>
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
          {isEditing ? '更新成果' : '添加成果'}
        </button>
      </div>
    </form>
  )
}

export default PublicationForm