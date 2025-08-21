import React, { useState, useEffect } from 'react'
import {
  Button, 
  Space,
  Tag,
  message,
  Row,
  Col,
  Card
} from 'antd'
import {
  FileText,
  Calendar,
  Users,
  Tag as TagIcon,
  Link,
  Eye,
  Clock,
  Image as ImageIcon,
  BookOpen,
  Delete
} from 'lucide-react'
import Image from 'next/image'
import dayjs from 'dayjs'
import type { Article } from '@/types/admin'
import UnifiedForm from '../../common/UnifiedForm'
import UnifiedFormField from '../../common/UnifiedFormField'

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
  
  const [authors, setAuthors] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [seoKeywords, setSeoKeywords] = useState<string[]>([])
  const [references, setReferences] = useState<{ title: string; url: string; authors?: string }[]>([])
  const [tableOfContents, setTableOfContents] = useState<{ level: number; title: string; anchor: string }[]>([])

  // 初始化表单数据
  useEffect(() => {
    if (article) {
      setAuthors(article.authors || [])
      setTags(article.tags || [])
      setImages(article.images || [])
      setSeoKeywords(article.seoKeywords || [])
      setReferences(article.references || [])
      setTableOfContents(article.tableOfContents || [])
    } else {
      setAuthors([])
      setTags([])
      setImages([])
      setSeoKeywords([])
      setReferences([])
      setTableOfContents([])
    }
  }, [article])

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

  // 表单验证规则
  const validationRules = {
    title: [
      { required: true, message: '请输入文章标题' },
      { min: 5, message: '文章标题至少需要5个字符' },
      { max: 200, message: '文章标题不能超过200个字符' }
    ],
    content: [
      { required: true, message: '请输入文章内容' },
      { min: 100, message: '文章内容至少需要100个字符' }
    ],
    summary: [
      { required: true, message: '请输入文章摘要' },
      { min: 50, message: '文章摘要至少需要50个字符' },
      { max: 1000, message: '文章摘要不能超过1000个字符' }
    ],
    category: [
      { required: true, message: '请输入文章分类' }
    ],
    featuredImage: [
      { 
        validator: (_, value) => {
          if (!value || isValidUrl(value)) {
            return Promise.resolve()
          }
          return Promise.reject(new Error('请输入有效的URL地址'))
        }
      }
    ],
    externalUrl: [
      { 
        validator: (_, value) => {
          if (!value || isValidUrl(value)) {
            return Promise.resolve()
          }
          return Promise.reject(new Error('请输入有效的URL地址'))
        }
      }
    ],
    doi: [
      { 
        validator: (_, value) => {
          if (!value || isValidDoi(value)) {
            return Promise.resolve()
          }
          return Promise.reject(new Error('请输入有效的DOI格式'))
        }
      }
    ],
    seoTitle: [
      { max: 60, message: 'SEO标题不能超过60个字符' }
    ],
    seoDescription: [
      { max: 160, message: 'SEO描述不能超过160个字符' }
    ]
  }

  // 添加作者
  const addAuthor = () => {
    if (authorInput.trim() && !authors.includes(authorInput.trim())) {
      setAuthors([...authors, authorInput.trim()])
      setAuthorInput('')
    }
  }

  // 删除作者
  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index))
  }

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // 删除标签
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  // 添加图片
  const addImage = () => {
    if (imageInput.trim() && isValidUrl(imageInput.trim()) && !images.includes(imageInput.trim())) {
      setImages([...images, imageInput.trim()])
      setImageInput('')
    }
  }

  // 删除图片
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // 添加SEO关键词
  const addSeoKeyword = () => {
    if (seoKeywordInput.trim() && !seoKeywords.includes(seoKeywordInput.trim())) {
      setSeoKeywords([...seoKeywords, seoKeywordInput.trim()])
      setSeoKeywordInput('')
    }
  }

  // 删除SEO关键词
  const removeSeoKeyword = (index: number) => {
    setSeoKeywords(seoKeywords.filter((_, i) => i !== index))
  }

  // 添加参考文献
  const addReference = () => {
    if (referenceTitle.trim() && referenceUrl.trim() && isValidUrl(referenceUrl.trim())) {
      const newRef = {
        title: referenceTitle.trim(),
        url: referenceUrl.trim(),
        authors: referenceAuthors.trim() || undefined
      }
      setReferences([...references, newRef])
      setReferenceTitle('')
      setReferenceUrl('')
      setReferenceAuthors('')
    }
  }

  // 删除参考文献
  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index))
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
      setTableOfContents([...tableOfContents, newTocItem])
      setTocTitle('')
    }
  }

  // 删除目录项
  const removeTocItem = (index: number) => {
    setTableOfContents(tableOfContents.filter((_, i) => i !== index))
  }

  // 处理表单提交
  const handleSubmit = async (values: Record<string, unknown>) => {
    // 验证作者
    if (authors.length === 0) {
      message.error('至少需要一个作者')
      return
    }

    const submitData: Partial<Article> = {
      title: values.title?.toString().trim(),
      content: values.content?.toString().trim(),
      summary: values.summary?.toString().trim(),
      type: values.type as string,
      authors: authors,
      tags: tags.length > 0 ? tags : undefined,
      category: values.category?.toString().trim(),
      featuredImage: values.featuredImage?.toString().trim() || undefined,
      images: images.length > 0 ? images : undefined,
      externalUrl: values.externalUrl?.toString().trim() || undefined,
      doi: values.doi?.toString().trim() || undefined,
      status: values.status as string,
      visibility: values.visibility as string,
      featured: values.featured as boolean,
      allowComments: values.allowComments as boolean,
      viewCount: values.viewCount as number,
      readingTime: values.readingTime as number,
      publishDate: values.publishDate ? (values.publishDate as Date).toISOString() : undefined,
      lastModified: new Date().toISOString(),
      seoTitle: values.seoTitle?.toString().trim() || undefined,
      seoDescription: values.seoDescription?.toString().trim() || undefined,
      seoKeywords: seoKeywords.length > 0 ? seoKeywords : undefined,
      references: references.length > 0 ? references : undefined,
      tableOfContents: tableOfContents.length > 0 ? tableOfContents : undefined
    }

    await onSubmit(submitData)
  }

  const isEditing = !!article

  // 准备初始值
  const initialValues = article ? {
    title: article.title || '',
    content: article.content || '',
    summary: article.summary || '',
    type: article.type || 'research',
    category: article.category || '',
    featuredImage: article.featuredImage || '',
    externalUrl: article.externalUrl || '',
    doi: article.doi || '',
    status: article.status || 'draft',
    visibility: article.visibility || 'public',
    featured: article.featured || false,
    allowComments: article.allowComments !== false,
    viewCount: article.viewCount || 0,
    readingTime: article.readingTime || 0,
    publishDate: article.publishDate ? dayjs(article.publishDate) : null,
    seoTitle: article.seoTitle || '',
    seoDescription: article.seoDescription || ''
  } : {
    title: '',
    content: '',
    summary: '',
    type: 'research',
    category: '',
    featuredImage: '',
    externalUrl: '',
    doi: '',
    status: 'draft',
    visibility: 'public',
    featured: false,
    allowComments: true,
    viewCount: 0,
    readingTime: 0,
    publishDate: dayjs(),
    seoTitle: '',
    seoDescription: ''
  }

  return (
    <UnifiedForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitText={isEditing ? '更新文章' : '添加文章'}
      loading={loading}
      initialValues={initialValues}
      showValidationStatus={true}
      showSuccessMessage={true}
      successMessage={isEditing ? '文章更新成功！' : '文章创建成功！'}
      resetOnSuccess={!isEditing}
      layoutType="vertical"
      containerType="card"
      buttonAlign="center"
    >
        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            基本信息
          </h3>
          
          <UnifiedFormField
            name="title"
            label="文章标题"
            type="input"
            placeholder="请输入文章标题"
            prefix={<FileText className="h-4 w-4" />}
            showCount
            maxLength={200}
            rules={[
              { required: true, message: '请输入文章标题' },
              { min: 5, message: '文章标题至少需要5个字符' },
              { max: 200, message: '文章标题不能超过200个字符' }
            ]}
          />
          
          <Row gutter={16}>
            <Col span={8}>
              <UnifiedFormField
                name="type"
                label="文章类型"
                type="select"
                placeholder="请选择文章类型"
                options={[
                  { value: 'research', label: '研究论文' },
                  { value: 'tutorial', label: '教程指南' },
                  { value: 'review', label: '综述文章' },
                  { value: 'opinion', label: '观点评论' },
                  { value: 'news', label: '新闻动态' },
                  { value: 'technical', label: '技术文档' }
                ]}
                rules={[{ required: true, message: '请选择文章类型' }]}
              />
            </Col>
            <Col span={8}>
              <UnifiedFormField
                name="status"
                label="发布状态"
                type="select"
                placeholder="请选择发布状态"
                options={[
                  { value: 'draft', label: '草稿' },
                  { value: 'published', label: '已发布' },
                  { value: 'archived', label: '已归档' },
                  { value: 'under_review', label: '审核中' }
                ]}
                rules={[{ required: true, message: '请选择发布状态' }]}
              />
            </Col>
            <Col span={8}>
              <UnifiedFormField
                name="visibility"
                label="可见性"
                type="select"
                placeholder="请选择可见性"
                options={[
                  { value: 'public', label: '公开' },
                  { value: 'private', label: '私有' },
                  { value: 'internal', label: '内部' }
                ]}
                rules={[{ required: true, message: '请选择可见性' }]}
              />
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <UnifiedFormField
                name="category"
                label="分类"
                type="input"
                placeholder="请输入文章分类"
                rules={[{ required: true, message: '请输入文章分类' }]}
              />
            </Col>
            <Col span={12}>
              <UnifiedFormField
                name="doi"
                label="DOI"
                type="input"
                placeholder="10.1000/182"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value || /^10\.\d{4,}\/.+/.test(value)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('请输入有效的DOI格式'))
                    }
                  }
                ]}
              />
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <UnifiedFormField
                name="featured"
                type="checkbox"
                label="特色文章"
              />
            </Col>
            <Col span={12}>
              <UnifiedFormField
                name="allowComments"
                type="checkbox"
                label="允许评论"
              />
            </Col>
          </Row>
        </div>

        {/* 作者信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            作者信息
          </h3>
          
          <UnifiedFormField
            name="authorInput"
            label="作者"
            type="input"
            placeholder="输入作者姓名并按回车添加"
            prefix={<Users className="h-4 w-4" />}
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            onPressEnter={addAuthor}
            suffix={
              <Button 
                type="primary" 
                onClick={addAuthor}
                disabled={!authorInput.trim()}
                size="small"
              >
                添加
              </Button>
            }
            rules={[{ required: authors.length === 0, message: '至少需要一个作者' }]}
          />
          
          {authors.length > 0 && (
            <div className="mb-4">
              {authors.map((author, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeAuthor(index)}
                  color="blue"
                  className="mb-2"
                >
                  {author}
                </Tag>
              ))}
            </div>
          )}
          
          {authors.length === 0 && (
            <div className="text-red-500 text-sm">至少需要一个作者</div>
          )}
        </div>

        {/* 内容信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            内容信息
          </h3>
          
          <UnifiedFormField
            name="summary"
            label="文章摘要"
            type="textarea"
            placeholder="请输入文章摘要（50-1000字符）"
            rows={4}
            showCount
            maxLength={1000}
            rules={[
              { required: true, message: '请输入文章摘要' },
              { min: 50, message: '文章摘要至少需要50个字符' },
              { max: 1000, message: '文章摘要不能超过1000个字符' }
            ]}
          />
          
          <UnifiedFormField
            name="content"
            label="文章内容"
            type="textarea"
            placeholder="请输入文章详细内容"
            rows={12}
            showCount
            rules={[
              { required: true, message: '请输入文章内容' },
              { min: 100, message: '文章内容至少需要100个字符' }
            ]}
          />
          
          <UnifiedFormField
            name="tagInput"
            label="标签"
            type="input"
            placeholder="输入标签并按回车添加"
            prefix={<TagIcon className="h-4 w-4" />}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onPressEnter={addTag}
            suffix={
              <Button 
                type="primary" 
                onClick={addTag}
                disabled={!tagInput.trim()}
                size="small"
              >
                添加
              </Button>
            }
          />
          
          {tags.length > 0 && (
            <div className="mb-4">
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeTag(index)}
                  color="green"
                  className="mb-2"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* 媒体信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            媒体信息
          </h3>
          
          <UnifiedFormField
            name="featuredImage"
            label="特色图片"
            type="input"
            placeholder="https://example.com/image.jpg"
            prefix={<ImageIcon className="h-4 w-4" />}
            rules={[
              { 
                validator: (_, value) => {
                  if (!value || isValidUrl(value)) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('请输入有效的URL地址'))
                }
              }
            ]}
          />
          
          <UnifiedFormField
            name="imageInput"
            label="其他图片"
            type="input"
            placeholder="输入图片URL并按回车添加"
            prefix={<ImageIcon className="h-4 w-4" />}
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onPressEnter={addImage}
            suffix={
              <Button 
                type="primary" 
                onClick={addImage}
                disabled={!imageInput.trim() || !isValidUrl(imageInput.trim())}
                size="small"
              >
                添加
              </Button>
            }
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image}
                    alt={`图片 ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-16 object-cover rounded border"
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<Delete size={12} />}
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          )}
          
          <UnifiedFormField
            name="externalUrl"
            label="外部链接"
            type="input"
            placeholder="https://example.com"
            prefix={<Link className="h-4 w-4" />}
            rules={[
              { 
                validator: (_, value) => {
                  if (!value || isValidUrl(value)) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('请输入有效的URL地址'))
                }
              }
            ]}
          />
        </div>

        {/* 时间和统计信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            时间和统计信息
          </h3>
          
          <Row gutter={16}>
            <Col span={8}>
              <UnifiedFormField
                name="publishDate"
                label="发布时间"
                type="datepicker"
                className="w-full"
              />
            </Col>
            <Col span={8}>
              <UnifiedFormField
                name="viewCount"
                label="浏览次数"
                type="number"
                min={0}
                className="w-full"
                prefix={<Eye className="h-4 w-4" />}
              />
            </Col>
            <Col span={8}>
              <UnifiedFormField
                name="readingTime"
                label="阅读时间（分钟）"
                type="number"
                min={0}
                className="w-full"
                prefix={<Clock className="h-4 w-4" />}
              />
            </Col>
          </Row>
        </div>

        {/* SEO信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            SEO信息
          </h3>
          
          <UnifiedFormField
            name="seoTitle"
            label="SEO标题"
            type="input"
            placeholder="SEO标题（建议60字符以内）"
            showCount
            maxLength={60}
            rules={[{ max: 60, message: 'SEO标题不能超过60个字符' }]}
          />
          
          <UnifiedFormField
            name="seoDescription"
            label="SEO描述"
            type="textarea"
            rows={3}
            placeholder="SEO描述（建议160字符以内）"
            showCount
            maxLength={160}
            rules={[{ max: 160, message: 'SEO描述不能超过160个字符' }]}
          />
          
          <UnifiedFormField
            name="seoKeywordInput"
            label="SEO关键词"
            type="input"
            placeholder="输入SEO关键词并按回车添加"
            value={seoKeywordInput}
            onChange={(e) => setSeoKeywordInput(e.target.value)}
            onPressEnter={addSeoKeyword}
            suffix={
              <Button 
                type="primary" 
                onClick={addSeoKeyword}
                disabled={!seoKeywordInput.trim()}
                size="small"
              >
                添加
              </Button>
            }
          />
          
          {seoKeywords.length > 0 && (
            <div className="mb-4">
              {seoKeywords.map((keyword, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeSeoKeyword(index)}
                  color="purple"
                  className="mb-2"
                >
                  {keyword}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* 参考文献 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Link className="h-5 w-5 mr-2" />
            参考文献
          </h3>
          
          <Row gutter={8}>
            <Col span={8}>
              <UnifiedFormField
                name="referenceTitle"
                type="input"
                placeholder="文献标题"
                value={referenceTitle}
                onChange={(e) => setReferenceTitle(e.target.value)}
              />
            </Col>
            <Col span={8}>
              <UnifiedFormField
                name="referenceUrl"
                type="input"
                placeholder="文献URL"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
              />
            </Col>
            <Col span={6}>
              <UnifiedFormField
                name="referenceAuthors"
                type="input"
                placeholder="作者（可选）"
                value={referenceAuthors}
                onChange={(e) => setReferenceAuthors(e.target.value)}
              />
            </Col>
            <Col span={2}>
              <Button 
                type="primary" 
                onClick={addReference}
                disabled={!referenceTitle.trim() || !referenceUrl.trim() || !isValidUrl(referenceUrl.trim())}
                block
              >
                添加
              </Button>
            </Col>
          </Row>
          
          {references.length > 0 && (
            <div className="mt-4 space-y-2">
              {references.map((ref, index) => (
                <Card key={index} size="small" className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{ref.title}</div>
                      {ref.authors && (
                        <div className="text-sm text-gray-600">作者：{ref.authors}</div>
                      )}
                      <div className="text-sm text-blue-600">
                        <a href={ref.url} target="_blank" rel="noopener noreferrer">
                          {ref.url}
                        </a>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => removeReference(index)}
                    >
                      删除
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 目录 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            目录
          </h3>
          
          <Row gutter={8}>
            <Col span={4}>
              <UnifiedFormField
                name="tocLevel"
                type="select"
                value={tocLevel}
                onChange={setTocLevel}
                className="w-full"
                options={[
                  { value: 1, label: 'H1' },
                  { value: 2, label: 'H2' },
                  { value: 3, label: 'H3' },
                  { value: 4, label: 'H4' }
                ]}
              />
            </Col>
            <Col span={18}>
              <UnifiedFormField
                name="tocTitle"
                type="input"
                value={tocTitle}
                onChange={(e) => setTocTitle(e.target.value)}
                onPressEnter={addTocItem}
                placeholder="目录标题"
                suffix={
                  <Button 
                    type="primary" 
                    onClick={addTocItem}
                    disabled={!tocTitle.trim()}
                    size="small"
                  >
                    添加
                  </Button>
                }
              />
            </Col>
          </Row>
          
          {tableOfContents.length > 0 && (
            <div className="mt-4 space-y-1">
              {tableOfContents.map((item, index) => (
                <Card 
                  key={index} 
                  size="small" 
                  className="bg-gray-50"
                  style={{ paddingLeft: `${item.level * 12 + 8}px` }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">H{item.level} {item.title}</span>
                      <span className="ml-2 text-xs text-gray-500">#{item.anchor}</span>
                    </div>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => removeTocItem(index)}
                    >
                      删除
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

    </UnifiedForm>
  )
}

export default ArticleForm