import React, { useState, useEffect } from 'react'
import { Wrench, Calendar, Users, Tag, Link, FileText, Download, Star, Github } from 'lucide-react'
import type { Tool } from '@/types/admin'
import LoadingSpinner from '../common/LoadingSpinner'

interface ToolFormProps {
  tool?: Tool | null
  onSubmit: (toolData: Partial<Tool>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const ToolForm: React.FC<ToolFormProps> = ({
  tool,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    version: '',
    type: 'software' as 'software' | 'dataset' | 'model' | 'library' | 'framework' | 'api',
    category: '',
    tags: [] as string[],
    authors: [] as string[],
    maintainers: [] as string[],
    license: '',
    homepage: '',
    repository: '',
    documentation: '',
    downloadUrl: '',
    demoUrl: '',
    screenshots: [] as string[],
    features: [] as string[],
    requirements: '',
    installation: '',
    usage: '',
    changelog: '',
    status: 'active' as 'active' | 'maintenance' | 'deprecated' | 'beta' | 'alpha',
    visibility: 'public' as 'public' | 'private' | 'internal',
    featured: false,
    downloadCount: 0,
    starCount: 0,
    forkCount: 0,
    issueCount: 0,
    releaseDate: '',
    lastUpdate: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [authorInput, setAuthorInput] = useState('')
  const [maintainerInput, setMaintainerInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')
  const [screenshotInput, setScreenshotInput] = useState('')

  // 初始化表单数据
  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name || '',
        description: tool.description || '',
        shortDescription: tool.shortDescription || '',
        version: tool.version || '',
        type: tool.type || 'software',
        category: tool.category || '',
        tags: tool.tags || [],
        authors: tool.authors || [],
        maintainers: tool.maintainers || [],
        license: tool.license || '',
        homepage: tool.homepage || '',
        repository: tool.repository || '',
        documentation: tool.documentation || '',
        downloadUrl: tool.downloadUrl || '',
        demoUrl: tool.demoUrl || '',
        screenshots: tool.screenshots || [],
        features: tool.features || [],
        requirements: tool.requirements || '',
        installation: tool.installation || '',
        usage: tool.usage || '',
        changelog: tool.changelog || '',
        status: tool.status || 'active',
        visibility: tool.visibility || 'public',
        featured: tool.featured || false,
        downloadCount: tool.downloadCount || 0,
        starCount: tool.starCount || 0,
        forkCount: tool.forkCount || 0,
        issueCount: tool.issueCount || 0,
        releaseDate: tool.releaseDate ? new Date(tool.releaseDate).toISOString().split('T')[0] : '',
        lastUpdate: tool.lastUpdate ? new Date(tool.lastUpdate).toISOString().split('T')[0] : ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        shortDescription: '',
        version: '1.0.0',
        type: 'software',
        category: '',
        tags: [],
        authors: [],
        maintainers: [],
        license: 'MIT',
        homepage: '',
        repository: '',
        documentation: '',
        downloadUrl: '',
        demoUrl: '',
        screenshots: [],
        features: [],
        requirements: '',
        installation: '',
        usage: '',
        changelog: '',
        status: 'active',
        visibility: 'public',
        featured: false,
        downloadCount: 0,
        starCount: 0,
        forkCount: 0,
        issueCount: 0,
        releaseDate: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0]
      })
    }
    setErrors({})
  }, [tool])

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 名称验证
    if (!formData.name.trim()) {
      newErrors.name = '工具名称不能为空'
    } else if (formData.name.length < 2) {
      newErrors.name = '工具名称至少需要2个字符'
    }

    // 描述验证
    if (!formData.description.trim()) {
      newErrors.description = '详细描述不能为空'
    } else if (formData.description.length < 10) {
      newErrors.description = '详细描述至少需要10个字符'
    }

    // 简短描述验证
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = '简短描述不能为空'
    } else if (formData.shortDescription.length > 200) {
      newErrors.shortDescription = '简短描述不能超过200个字符'
    }

    // 版本验证
    if (!formData.version.trim()) {
      newErrors.version = '版本号不能为空'
    } else if (!/^\d+\.\d+\.\d+/.test(formData.version)) {
      newErrors.version = '版本号格式应为 x.y.z（如：1.0.0）'
    }

    // 作者验证
    if (formData.authors.length === 0) {
      newErrors.authors = '至少需要一个作者'
    }

    // URL验证
    const urlFields = ['homepage', 'repository', 'documentation', 'downloadUrl', 'demoUrl']
    urlFields.forEach(field => {
      const value = formData[field as keyof typeof formData] as string
      if (value && !isValidUrl(value)) {
        newErrors[field] = '请输入有效的URL地址'
      }
    })

    // 截图URL验证
    formData.screenshots.forEach((url, index) => {
      if (!isValidUrl(url)) {
        newErrors[`screenshot_${index}`] = `截图${index + 1}的URL格式无效`
      }
    })

    // 统计数据验证
    const countFields = ['downloadCount', 'starCount', 'forkCount', 'issueCount']
    countFields.forEach(field => {
      const value = formData[field as keyof typeof formData] as number
      if (value < 0) {
        newErrors[field] = '统计数据不能为负数'
      }
    })

    // 日期验证
    if (formData.releaseDate && formData.lastUpdate) {
      const releaseDate = new Date(formData.releaseDate)
      const lastUpdate = new Date(formData.lastUpdate)
      if (lastUpdate < releaseDate) {
        newErrors.lastUpdate = '最后更新时间不能早于发布时间'
      }
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

  // 添加维护者
  const addMaintainer = () => {
    if (maintainerInput.trim() && !formData.maintainers.includes(maintainerInput.trim())) {
      handleInputChange('maintainers', [...formData.maintainers, maintainerInput.trim()])
      setMaintainerInput('')
    }
  }

  // 删除维护者
  const removeMaintainer = (index: number) => {
    const newMaintainers = formData.maintainers.filter((_, i) => i !== index)
    handleInputChange('maintainers', newMaintainers)
  }

  // 添加功能特性
  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      handleInputChange('features', [...formData.features, featureInput.trim()])
      setFeatureInput('')
    }
  }

  // 删除功能特性
  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    handleInputChange('features', newFeatures)
  }

  // 添加截图
  const addScreenshot = () => {
    if (screenshotInput.trim() && isValidUrl(screenshotInput.trim()) && !formData.screenshots.includes(screenshotInput.trim())) {
      handleInputChange('screenshots', [...formData.screenshots, screenshotInput.trim()])
      setScreenshotInput('')
    }
  }

  // 删除截图
  const removeScreenshot = (index: number) => {
    const newScreenshots = formData.screenshots.filter((_, i) => i !== index)
    handleInputChange('screenshots', newScreenshots)
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<Tool> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        version: formData.version.trim(),
        type: formData.type,
        category: formData.category.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        authors: formData.authors,
        maintainers: formData.maintainers.length > 0 ? formData.maintainers : undefined,
        license: formData.license.trim() || undefined,
        homepage: formData.homepage.trim() || undefined,
        repository: formData.repository.trim() || undefined,
        documentation: formData.documentation.trim() || undefined,
        downloadUrl: formData.downloadUrl.trim() || undefined,
        demoUrl: formData.demoUrl.trim() || undefined,
        screenshots: formData.screenshots.length > 0 ? formData.screenshots : undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        requirements: formData.requirements.trim() || undefined,
        installation: formData.installation.trim() || undefined,
        usage: formData.usage.trim() || undefined,
        changelog: formData.changelog.trim() || undefined,
        status: formData.status,
        visibility: formData.visibility,
        featured: formData.featured,
        downloadCount: formData.downloadCount,
        starCount: formData.starCount,
        forkCount: formData.forkCount,
        issueCount: formData.issueCount,
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : undefined,
        lastUpdate: formData.lastUpdate ? new Date(formData.lastUpdate).toISOString() : undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('提交工具表单失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!tool

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
        {/* 工具名称 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            工具名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入工具名称"
            disabled={loading || isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* 简短描述 */}
        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
            简短描述 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.shortDescription ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入简短描述（不超过200字符）"
            maxLength={200}
            disabled={loading || isSubmitting}
          />
          <div className="mt-1 flex justify-between">
            {errors.shortDescription && (
              <p className="text-sm text-red-600">{errors.shortDescription}</p>
            )}
            <p className="text-sm text-gray-500">{formData.shortDescription.length}/200</p>
          </div>
        </div>

        {/* 类型、版本、状态 */}
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
              <option value="software">软件工具</option>
              <option value="dataset">数据集</option>
              <option value="model">模型</option>
              <option value="library">库</option>
              <option value="framework">框架</option>
              <option value="api">API</option>
            </select>
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
              版本号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="version"
              value={formData.version}
              onChange={(e) => handleInputChange('version', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.version ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="如：1.0.0"
              disabled={loading || isSubmitting}
            />
            {errors.version && (
              <p className="mt-1 text-sm text-red-600">{errors.version}</p>
            )}
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
              <option value="active">活跃</option>
              <option value="maintenance">维护中</option>
              <option value="deprecated">已弃用</option>
              <option value="beta">测试版</option>
              <option value="alpha">内测版</option>
            </select>
          </div>
        </div>

        {/* 分类和许可证 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              分类
            </label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：机器学习、数据分析"
              disabled={loading || isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
              许可证
            </label>
            <input
              type="text"
              id="license"
              value={formData.license}
              onChange={(e) => handleInputChange('license', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="如：MIT、Apache-2.0"
              disabled={loading || isSubmitting}
            />
          </div>
        </div>

        {/* 可见性和特色标记 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              设为特色工具
            </label>
          </div>
        </div>
      </div>

      {/* 人员信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          人员信息
        </h3>
        
        {/* 作者 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            作者 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAuthor())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入作者姓名并按回车添加"
              disabled={loading || isSubmitting}
            />
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

        {/* 维护者 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            维护者
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={maintainerInput}
              onChange={(e) => setMaintainerInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaintainer())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入维护者姓名并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addMaintainer}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !maintainerInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.maintainers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.maintainers.map((maintainer, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {maintainer}
                  <button
                    type="button"
                    onClick={() => removeMaintainer(index)}
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

      {/* 链接信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Link className="h-5 w-5 mr-2" />
          链接信息
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 主页 */}
          <div>
            <label htmlFor="homepage" className="block text-sm font-medium text-gray-700 mb-1">
              主页
            </label>
            <input
              type="url"
              id="homepage"
              value={formData.homepage}
              onChange={(e) => handleInputChange('homepage', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.homepage ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="https://example.com"
              disabled={loading || isSubmitting}
            />
            {errors.homepage && (
              <p className="mt-1 text-sm text-red-600">{errors.homepage}</p>
            )}
          </div>

          {/* 代码仓库 */}
          <div>
            <label htmlFor="repository" className="block text-sm font-medium text-gray-700 mb-1">
              代码仓库
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="repository"
                value={formData.repository}
                onChange={(e) => handleInputChange('repository', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.repository ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="https://github.com/user/repo"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.repository && (
              <p className="mt-1 text-sm text-red-600">{errors.repository}</p>
            )}
          </div>

          {/* 文档 */}
          <div>
            <label htmlFor="documentation" className="block text-sm font-medium text-gray-700 mb-1">
              文档
            </label>
            <input
              type="url"
              id="documentation"
              value={formData.documentation}
              onChange={(e) => handleInputChange('documentation', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.documentation ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="https://docs.example.com"
              disabled={loading || isSubmitting}
            />
            {errors.documentation && (
              <p className="mt-1 text-sm text-red-600">{errors.documentation}</p>
            )}
          </div>

          {/* 下载链接 */}
          <div>
            <label htmlFor="downloadUrl" className="block text-sm font-medium text-gray-700 mb-1">
              下载链接
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Download className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="downloadUrl"
                value={formData.downloadUrl}
                onChange={(e) => handleInputChange('downloadUrl', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.downloadUrl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="https://download.example.com"
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.downloadUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.downloadUrl}</p>
            )}
          </div>

          {/* 演示链接 */}
          <div className="md:col-span-2">
            <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              演示链接
            </label>
            <input
              type="url"
              id="demoUrl"
              value={formData.demoUrl}
              onChange={(e) => handleInputChange('demoUrl', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.demoUrl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="https://demo.example.com"
              disabled={loading || isSubmitting}
            />
            {errors.demoUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.demoUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Star className="h-5 w-5 mr-2" />
          统计信息
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="downloadCount" className="block text-sm font-medium text-gray-700 mb-1">
              下载次数
            </label>
            <input
              type="number"
              id="downloadCount"
              value={formData.downloadCount}
              onChange={(e) => handleInputChange('downloadCount', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.downloadCount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              min="0"
              disabled={loading || isSubmitting}
            />
            {errors.downloadCount && (
              <p className="mt-1 text-sm text-red-600">{errors.downloadCount}</p>
            )}
          </div>

          <div>
            <label htmlFor="starCount" className="block text-sm font-medium text-gray-700 mb-1">
              Star数
            </label>
            <input
              type="number"
              id="starCount"
              value={formData.starCount}
              onChange={(e) => handleInputChange('starCount', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.starCount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              min="0"
              disabled={loading || isSubmitting}
            />
            {errors.starCount && (
              <p className="mt-1 text-sm text-red-600">{errors.starCount}</p>
            )}
          </div>

          <div>
            <label htmlFor="forkCount" className="block text-sm font-medium text-gray-700 mb-1">
              Fork数
            </label>
            <input
              type="number"
              id="forkCount"
              value={formData.forkCount}
              onChange={(e) => handleInputChange('forkCount', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.forkCount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              min="0"
              disabled={loading || isSubmitting}
            />
            {errors.forkCount && (
              <p className="mt-1 text-sm text-red-600">{errors.forkCount}</p>
            )}
          </div>

          <div>
            <label htmlFor="issueCount" className="block text-sm font-medium text-gray-700 mb-1">
              Issue数
            </label>
            <input
              type="number"
              id="issueCount"
              value={formData.issueCount}
              onChange={(e) => handleInputChange('issueCount', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.issueCount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              min="0"
              disabled={loading || isSubmitting}
            />
            {errors.issueCount && (
              <p className="mt-1 text-sm text-red-600">{errors.issueCount}</p>
            )}
          </div>
        </div>

        {/* 日期信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-1">
              发布日期
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="releaseDate"
                value={formData.releaseDate}
                onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastUpdate" className="block text-sm font-medium text-gray-700 mb-1">
              最后更新
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="lastUpdate"
                value={formData.lastUpdate}
                onChange={(e) => handleInputChange('lastUpdate', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastUpdate ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={loading || isSubmitting}
              />
            </div>
            {errors.lastUpdate && (
              <p className="mt-1 text-sm text-red-600">{errors.lastUpdate}</p>
            )}
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          详细信息
        </h3>
        
        {/* 详细描述 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            详细描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="请输入详细描述"
            disabled={loading || isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
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
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
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

        {/* 功能特性 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            功能特性
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入功能特性并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !featureInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.features.length > 0 && (
            <div className="space-y-1">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm text-gray-700">• {feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-400 hover:text-red-600"
                    disabled={loading || isSubmitting}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 截图 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            截图
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="url"
              value={screenshotInput}
              onChange={(e) => setScreenshotInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addScreenshot())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入截图URL并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addScreenshot}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || isSubmitting || !screenshotInput.trim() || !isValidUrl(screenshotInput.trim())}
            >
              添加
            </button>
          </div>
          {formData.screenshots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {formData.screenshots.map((screenshot, index) => (
                <div key={index} className="relative group">
                  <img
                    src={screenshot}
                    alt={`截图 ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM4LjY4NjI5IDE2IDYgMTMuMzEzNyA2IDEwQzYgNi42ODYyOSA4LjY4NjI5IDQgMTIgNEMxNS4zMTM3IDQgMTggNi42ODYyOSAxOCAxMEMxOCAxMy4zMTM3IDE1LjMxMzcgMTYgMTIgMTZaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading || isSubmitting}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 系统要求 */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            系统要求
          </label>
          <textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => handleInputChange('requirements', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入系统要求"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 安装说明 */}
        <div>
          <label htmlFor="installation" className="block text-sm font-medium text-gray-700 mb-1">
            安装说明
          </label>
          <textarea
            id="installation"
            value={formData.installation}
            onChange={(e) => handleInputChange('installation', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入安装说明"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 使用说明 */}
        <div>
          <label htmlFor="usage" className="block text-sm font-medium text-gray-700 mb-1">
            使用说明
          </label>
          <textarea
            id="usage"
            value={formData.usage}
            onChange={(e) => handleInputChange('usage', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入使用说明"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 更新日志 */}
        <div>
          <label htmlFor="changelog" className="block text-sm font-medium text-gray-700 mb-1">
            更新日志
          </label>
          <textarea
            id="changelog"
            value={formData.changelog}
            onChange={(e) => handleInputChange('changelog', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入更新日志"
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
          {isEditing ? '更新工具' : '添加工具'}
        </button>
      </div>
    </form>
  )
}

export default ToolForm