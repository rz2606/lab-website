import React, { useState, useEffect } from 'react'
import {
  Form,
  Button,
  Row,
  Col,
  Tag as AntTag
} from 'antd'
import {
  Newspaper,
  Users,
  FileText,
  Tag,
  Calendar,
  Link,
  Eye,
  Delete
} from 'lucide-react'
import Image from 'next/image'
import dayjs from 'dayjs'
import { UnifiedForm } from '@/components/common/UnifiedForm'
import { UnifiedFormField } from '@/components/common/UnifiedFormField'
import { News } from '../../../types/news'

// const { TextArea } = Input
// const { Option } = Select

interface NewsFormProps {
  news?: News
  onSubmit: (data: Partial<News>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const NewsForm: React.FC<NewsFormProps> = ({ news, onSubmit, onCancel, loading = false }) => {
  const [form] = Form.useForm()
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [relatedLinks, setRelatedLinks] = useState<{ title: string; url: string }[]>([])
  const isEditing = !!news

  useEffect(() => {
    if (news) {
      form.setFieldsValue({
        title: news.title,
        type: news.type,
        status: news.status,
        visibility: news.visibility,
        author: news.author,
        source: news.source,
        featured: news.featured,
        urgent: news.urgent,
        allowComments: news.allowComments,
        summary: news.summary,
        content: news.content,
        externalUrl: news.externalUrl,
        publishDate: news.publishDate ? dayjs(news.publishDate) : null,
        expiryDate: news.expiryDate ? dayjs(news.expiryDate) : null,
        eventDate: news.eventDate ? dayjs(news.eventDate) : null,
        viewCount: news.viewCount,
        location: news.location,
        contactInfo: news.contactInfo
      })
      setTags(news.tags || [])
      setImages(news.images || [])
      setRelatedLinks(news.relatedLinks || [])
    }
  }, [news, form])

  // const validationRules = {
  //   title: [
  //     { required: true, message: '请输入新闻标题' },
  //     { min: 5, message: '标题至少需要5个字符' },
  //     { max: 200, message: '标题不能超过200个字符' }
  //   ],
  //   content: [
  //     { required: true, message: '请输入新闻内容' },
  //     { min: 50, message: '内容至少需要50个字符' }
  //   ],
  //   summary: [
  //     { required: true, message: '请输入新闻摘要' },
  //     { min: 20, message: '摘要至少需要20个字符' },
  //     { max: 500, message: '摘要不能超过500个字符' }
  //   ],
  //   author: [
  //     { required: true, message: '请输入作者姓名' }
  //   ],
  //   featuredImage: [
  //     { required: true, message: '请上传特色图片' }
  //   ],
  //   externalUrl: [
  //     {
  //       validator: (_: unknown, value: string) => {
  //         if (!value || isValidUrl(value)) {
  //           return Promise.resolve()
  //         }
  //         return Promise.reject(new Error('请输入有效的URL格式'))
  //       }
  //     }
  //   ],
  //   viewCount: [
  //     { type: 'number', min: 0, message: '浏览次数不能为负数' }
  //   ]
  // }

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const addImage = () => {
    const trimmedImage = imageInput.trim()
    if (trimmedImage && isValidUrl(trimmedImage) && !images.includes(trimmedImage)) {
      setImages([...images, trimmedImage])
      setImageInput('')
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addRelatedLink = () => {
    const trimmedTitle = linkTitle.trim()
    const trimmedUrl = linkUrl.trim()
    if (trimmedTitle && trimmedUrl && isValidUrl(trimmedUrl)) {
      setRelatedLinks([...relatedLinks, { title: trimmedTitle, url: trimmedUrl }])
      setLinkTitle('')
      setLinkUrl('')
    }
  }

  const removeRelatedLink = (index: number) => {
    setRelatedLinks(relatedLinks.filter((_, i) => i !== index))
  }

  // const handleFormChange = (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
  //   // 处理表单变化
  // }

  const handleSubmit = async (values: Record<string, unknown>) => {
    const newsData = {
      ...values,
      publishDate: values.publishDate ? values.publishDate.toISOString() : null,
      expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
      eventDate: values.eventDate ? values.eventDate.toISOString() : null,
      tags,
      images,
      relatedLinks
    }
    
    await onSubmit(newsData)
  }

  return (
    <UnifiedForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitText={isEditing ? '更新新闻' : '添加新闻'}
      loading={loading}
      showValidationStatus={true}
      showSuccessMessage={true}
      successMessage={isEditing ? '新闻更新成功！' : '新闻创建成功！'}
      resetOnSuccess={!isEditing}
      layoutType="vertical"
      containerType="card"
      buttonAlign="center"
    >
        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Newspaper className="h-5 w-5 mr-2" />
            基本信息
          </h3>
          
          {/* 新闻标题 */}
          <UnifiedFormField
            name="title"
            label="新闻标题"
            type="input"
            placeholder="请输入新闻标题"
            prefix={<Newspaper className="h-4 w-4" />}
            showCount
            maxLength={200}
            validationType="news"
          />

          {/* 类型、状态、可见性 */}
          <Row gutter={16}>
            <Col span={8}>
              <UnifiedFormField
                name="type"
                label="新闻类型"
                type="select"
                placeholder="请选择新闻类型"
                options={[
                  { value: 'general', label: '一般新闻' },
                  { value: 'research', label: '研究动态' },
                  { value: 'event', label: '活动通知' },
                  { value: 'announcement', label: '公告通知' },
                  { value: 'achievement', label: '成果发布' },
                  { value: 'collaboration', label: '合作交流' }
                ]}
                validationType="news"
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
                  { value: 'scheduled', label: '定时发布' },
                  { value: 'archived', label: '已归档' }
                ]}
                validationType="news"
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
                  { value: 'internal', label: '内部' },
                  { value: 'private', label: '私有' }
                ]}
                validationType="news"
              />
            </Col>
          </Row>

          {/* 作者和来源 */}
          <Row gutter={16}>
            <Col span={12}>
              <UnifiedFormField
                name="author"
                label="作者"
                type="input"
                placeholder="请输入作者姓名"
                prefix={<Users className="h-4 w-4" />}
                validationType="news"
              />
            </Col>
            <Col span={12}>
              <UnifiedFormField
                name="source"
                label="新闻来源"
                type="input"
                placeholder="如：实验室官网、新华社"
                validationType="news"
              />
            </Col>
          </Row>

          {/* 特殊标记 */}
          <Row gutter={16}>
            <Col span={8}>
              <UnifiedFormField
                name="featured"
                type="checkbox"
                label="设为特色新闻"
                validationType="news"
              />
            </Col>
            <Col span={8}>
              <UnifiedFormField
                name="urgent"
                type="checkbox"
                label="紧急新闻"
                validationType="news"
              />
            </Col>
            <Col span={8}>
              <UnifiedFormField
                name="allowComments"
                type="checkbox"
                label="允许评论"
                validationType="news"
              />
            </Col>
          </Row>
        </div>

        {/* 内容信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            内容信息
          </h3>
          
          {/* 新闻摘要 */}
          <UnifiedFormField
            name="summary"
            label="新闻摘要"
            type="textarea"
            placeholder="请输入新闻摘要（20-500字符）"
            rows={3}
            showCount
            maxLength={500}
            validationType="news"
          />

          {/* 新闻内容 */}
          <UnifiedFormField
            name="content"
            label="新闻内容"
            type="textarea"
            placeholder="请输入新闻详细内容"
            rows={8}
            showCount
            validationType="news"
          />

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
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <AntTag
                    key={index}
                    closable
                    onClose={() => removeTag(index)}
                    className="mb-1"
                  >
                    {tag}
                  </AntTag>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 媒体信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            媒体信息
          </h3>
          
          {/* 特色图片 */}
          <UnifiedFormField
            name="featuredImage"
            label="特色图片"
            type="input"
            placeholder="https://example.com/image.jpg"
            prefix={<FileText className="h-4 w-4" />}
            validationType="news"
          />

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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="图片URL"
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
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`图片 ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<Delete className="h-3 w-3" />}
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      danger
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 外部链接 */}
          <UnifiedFormField
            name="externalUrl"
            label="外部链接"
            type="input"
            placeholder="https://example.com/news"
            prefix={<Link className="h-4 w-4" />}
            validationType="news"
          />
        </div>

        {/* 时间和地点信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            时间和地点信息
          </h3>
          
          <Row gutter={16}>
            {/* 发布时间 */}
            <Col span={12}>
              <UnifiedFormField
                name="publishDate"
                label="发布时间"
                type="datepicker"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                validationType="news"
              />
            </Col>

            {/* 过期时间 */}
            <Col span={12}>
              <UnifiedFormField
                name="expiryDate"
                label="过期时间"
                type="datepicker"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                validationType="news"
              />
            </Col>

            {/* 活动时间 */}
            <Col span={12}>
              <UnifiedFormField
                name="eventDate"
                label="活动时间"
                type="datepicker"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                validationType="news"
              />
            </Col>

            {/* 浏览次数 */}
            <Col span={12}>
              <UnifiedFormField
                name="viewCount"
                label="浏览次数"
                type="number"
                prefix={<Eye className="h-4 w-4" />}
                min={0}
                validationType="news"
              />
            </Col>
          </Row>

          {/* 地点和联系信息 */}
          <Row gutter={16}>
            <Col span={12}>
              <UnifiedFormField
                name="location"
                label="活动地点"
                type="input"
                placeholder="如：北京大学英杰交流中心"
                validationType="news"
              />
            </Col>
            <Col span={12}>
              <UnifiedFormField
                name="contactInfo"
                label="联系信息"
                type="input"
                placeholder="如：联系人：张三，电话：010-12345678"
                validationType="news"
              />
            </Col>
          </Row>
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
            
            {relatedLinks.length > 0 && (
              <div className="space-y-2">
                {relatedLinks.map((link, index) => (
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
                    <Button
                      type="text"
                      size="small"
                      icon={<Delete className="h-3 w-3" />}
                      onClick={() => removeRelatedLink(index)}
                      danger
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

    </UnifiedForm>
  )
}

export default NewsForm