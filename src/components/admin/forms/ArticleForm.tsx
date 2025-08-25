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
      // 处理authors字段 - 如果是字符串则转换为数组
      const authorsArray = Array.isArray(article.authors) 
        ? article.authors 
        : (article.authors ? article.authors.split(',').map(a => a.trim()).filter(a => a) : [])
      
      setAuthors(authorsArray)
      setTags([])
      setImages([])
      setSeoKeywords([])
      setReferences([])
      setTableOfContents([])
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
      authors: authors.join(', '),
      journal: values.journal?.toString().trim() || '',
      publishedDate: values.publishedDate ? dayjs(values.publishedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      doi: values.doi?.toString().trim(),
      abstract: values.abstract?.toString().trim(),
      keywords: values.keywords?.toString().trim(),
      impactFactor: values.impactFactor as number,
      category: values.category?.toString().trim(),
      citationCount: values.citationCount as number,
      isOpenAccess: values.isOpenAccess as boolean
    }

    await onSubmit(submitData)
  }

  const isEditing = !!article

  // 准备初始值
  const initialValues = article ? {
    title: article.title || '',
      journal: article.journal || '',
      doi: article.doi || '',
      abstract: article.abstract || '',
      keywords: article.keywords || '',
      impactFactor: article.impactFactor || 0,
      category: article.category || '',
      citationCount: article.citationCount || 0,
      isOpenAccess: article.isOpenAccess || false,
      publishedDate: article.publishedDate ? dayjs(article.publishedDate) : null
  } : {
      title: '',
      journal: '',
      doi: '',
      abstract: '',
      keywords: '',
      impactFactor: 0,
      category: '',
      citationCount: 0,
      isOpenAccess: false,
      publishedDate: dayjs()
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
            rules={[
              { required: true, message: '请输入文章标题' },
              { min: 5, message: '文章标题至少需要5个字符' },
              { max: 200, message: '文章标题不能超过200个字符' }
            ]}
          />
          
          <UnifiedFormField
            name="publishedDate"
            label="发布日期"
            type="date"
            placeholder="请选择发布日期"
          />
        </div>

        {/* 作者信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            作者信息
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入作者姓名并按回车添加"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAuthor()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <Button 
              type="primary" 
              onClick={addAuthor}
              disabled={!authorInput.trim()}
              size="small"
            >
              添加
            </Button>
          </div>
          
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
            name="journal"
            label="期刊名称"
            type="input"
            placeholder="请输入期刊名称"
            rules={[
              { required: true, message: '请输入期刊名称' }
            ]}
          />
          
          <UnifiedFormField
            name="doi"
            label="DOI"
            type="input"
            placeholder="请输入DOI"
          />
          
          <UnifiedFormField
            name="abstract"
            label="文章摘要"
            type="textarea"
            placeholder="请输入文章摘要"
            rules={[
              { min: 10, message: '摘要至少10个字符' }
            ]}
          />
          
          <UnifiedFormField
            name="keywords"
            label="关键词"
            type="input"
            placeholder="请输入关键词，用逗号分隔"
          />
          
          <UnifiedFormField
            name="impactFactor"
            label="影响因子"
            type="number"
          />
          
          <UnifiedFormField
            name="category"
            label="分类"
            type="input"
            placeholder="请输入文章分类"
          />
          
          <UnifiedFormField
            name="citationCount"
            label="引用次数"
            type="number"
          />
          
          <UnifiedFormField
            name="isOpenAccess"
            label="开放获取"
            type="checkbox"
          />
        </div>



    </UnifiedForm>
  )
}

export default ArticleForm