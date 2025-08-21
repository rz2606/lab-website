import React, { useState, useEffect } from 'react'
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Checkbox, 
  DatePicker, 
  InputNumber,
  Space,
  Tag,
  message,
  Row,
  Col
} from 'antd'
import { 
  FileText, 
  Calendar, 
  Users, 
  Tag as TagIcon, 
  Link, 
  Eye, 
  BookOpen,
  Award,
  Building
} from 'lucide-react'
import dayjs from 'dayjs'
import type { Publication } from '@/types/admin'
import LoadingSpinner from '../common/LoadingSpinner'

const { TextArea } = Input
const { Option } = Select

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
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authorInput, setAuthorInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [affiliationInput, setAffiliationInput] = useState('')
  
  const [authors, setAuthors] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [affiliations, setAffiliations] = useState<string[]>([])

  // 初始化表单数据
  useEffect(() => {
    if (publication) {
      form.setFieldsValue({
        title: publication.title || '',
        abstract: publication.abstract || '',
        type: publication.type || 'journal',
        journal: publication.journal || '',
        conference: publication.conference || '',
        publisher: publication.publisher || '',
        volume: publication.volume || '',
        issue: publication.issue || '',
        pages: publication.pages || '',
        year: publication.year || new Date().getFullYear(),
        month: publication.month || '',
        doi: publication.doi || '',
        isbn: publication.isbn || '',
        issn: publication.issn || '',
        url: publication.url || '',
        pdfUrl: publication.pdfUrl || '',
        citationCount: publication.citationCount || 0,
        status: publication.status || 'published',
        visibility: publication.visibility || 'public',
        featured: publication.featured || false,
        openAccess: publication.openAccess || false,
        peerReviewed: publication.peerReviewed !== false,
        publishDate: publication.publishDate ? dayjs(publication.publishDate) : null,
        submissionDate: publication.submissionDate ? dayjs(publication.submissionDate) : null,
        acceptanceDate: publication.acceptanceDate ? dayjs(publication.acceptanceDate) : null,
        impactFactor: publication.impactFactor || undefined,
        quartile: publication.quartile || undefined,
        venue: publication.venue || '',
        location: publication.location || '',
        note: publication.note || ''
      })
      setAuthors(publication.authors || [])
      setTags(publication.tags || [])
      setKeywords(publication.keywords || [])
      setAffiliations(publication.affiliations || [])
    } else {
      form.setFieldsValue({
        title: '',
        abstract: '',
        type: 'journal',
        journal: '',
        conference: '',
        publisher: '',
        volume: '',
        issue: '',
        pages: '',
        year: new Date().getFullYear(),
        month: '',
        doi: '',
        isbn: '',
        issn: '',
        url: '',
        pdfUrl: '',
        citationCount: 0,
        status: 'published',
        visibility: 'public',
        featured: false,
        openAccess: false,
        peerReviewed: true,
        publishDate: dayjs(),
        submissionDate: null,
        acceptanceDate: null,
        impactFactor: undefined,
        quartile: undefined,
        venue: '',
        location: '',
        note: ''
      })
      setAuthors([])
      setTags([])
      setKeywords([])
      setAffiliations([])
    }
  }, [publication, form])

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

  // ISBN验证函数
  const isValidIsbn = (isbn: string) => {
    const isbnPattern = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/
    return isbnPattern.test(isbn.replace(/[- ]/g, ''))
  }

  // ISSN验证函数
  const isValidIssn = (issn: string) => {
    const issnPattern = /^\d{4}-\d{3}[\dX]$/
    return issnPattern.test(issn)
  }

  // 表单验证规则
  const validationRules = {
    title: [
      { required: true, message: '请输入出版物标题' },
      { min: 5, message: '出版物标题至少需要5个字符' },
      { max: 300, message: '出版物标题不能超过300个字符' }
    ],
    abstract: [
      { required: true, message: '请输入摘要' },
      { min: 100, message: '摘要至少需要100个字符' },
      { max: 2000, message: '摘要不能超过2000个字符' }
    ],
    year: [
      { required: true, message: '请输入发表年份' },
      { 
        validator: (_, value) => {
          const currentYear = new Date().getFullYear()
          if (value && (value < 1900 || value > currentYear + 5)) {
            return Promise.reject(new Error(`年份应在1900-${currentYear + 5}之间`))
          }
          return Promise.resolve()
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
    isbn: [
      { 
        validator: (_, value) => {
          if (!value || isValidIsbn(value)) {
            return Promise.resolve()
          }
          return Promise.reject(new Error('请输入有效的ISBN格式'))
        }
      }
    ],
    issn: [
      { 
        validator: (_, value) => {
          if (!value || isValidIssn(value)) {
            return Promise.resolve()
          }
          return Promise.reject(new Error('请输入有效的ISSN格式（如：1234-5678）'))
        }
      }
    ],
    url: [
      { 
        validator: (_, value) => {
          if (!value || isValidUrl(value)) {
            return Promise.resolve()
          }
          return Promise.reject(new Error('请输入有效的URL地址'))
        }
      }
    ],
    pdfUrl: [
      { 
        validator: (_, value) => {
          if (!value || isValidUrl(value)) {
            return Promise.resolve()
          }
          return Promise.reject(new Error('请输入有效的PDF URL地址'))
        }
      }
    ],
    impactFactor: [
      { 
        validator: (_, value) => {
          if (!value || (value >= 0 && value <= 100)) {
            return Promise.resolve()
          }
          return Promise.reject(new Error('影响因子应在0-100之间'))
        }
      }
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

  // 添加关键词
  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  // 删除关键词
  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  // 添加机构
  const addAffiliation = () => {
    if (affiliationInput.trim() && !affiliations.includes(affiliationInput.trim())) {
      setAffiliations([...affiliations, affiliationInput.trim()])
      setAffiliationInput('')
    }
  }

  // 删除机构
  const removeAffiliation = (index: number) => {
    setAffiliations(affiliations.filter((_, i) => i !== index))
  }

  // 处理表单提交
  const handleSubmit = async (values: Record<string, unknown>) => {
    // 验证作者
    if (authors.length === 0) {
      message.error('至少需要一个作者')
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<Publication> = {
        title: values.title?.trim(),
        abstract: values.abstract?.trim(),
        type: values.type,
        authors: authors,
        affiliations: affiliations.length > 0 ? affiliations : undefined,
        tags: tags.length > 0 ? tags : undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
        journal: values.journal?.trim() || undefined,
        conference: values.conference?.trim() || undefined,
        publisher: values.publisher?.trim() || undefined,
        volume: values.volume?.trim() || undefined,
        issue: values.issue?.trim() || undefined,
        pages: values.pages?.trim() || undefined,
        year: values.year,
        month: values.month?.trim() || undefined,
        doi: values.doi?.trim() || undefined,
        isbn: values.isbn?.trim() || undefined,
        issn: values.issn?.trim() || undefined,
        url: values.url?.trim() || undefined,
        pdfUrl: values.pdfUrl?.trim() || undefined,
        citationCount: values.citationCount || 0,
        status: values.status,
        visibility: values.visibility,
        featured: values.featured,
        openAccess: values.openAccess,
        peerReviewed: values.peerReviewed,
        publishDate: values.publishDate ? values.publishDate.toISOString() : undefined,
        submissionDate: values.submissionDate ? values.submissionDate.toISOString() : undefined,
        acceptanceDate: values.acceptanceDate ? values.acceptanceDate.toISOString() : undefined,
        lastModified: new Date().toISOString(),
        impactFactor: values.impactFactor || undefined,
        quartile: values.quartile || undefined,
        venue: values.venue?.trim() || undefined,
        location: values.location?.trim() || undefined,
        note: values.note?.trim() || undefined
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('提交出版物表单失败:', error)
      message.error('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!publication

  return (
    <Card title={isEditing ? '编辑出版物' : '添加出版物'} className="w-full">
      {(loading || isSubmitting) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <LoadingSpinner size="lg" />
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading || isSubmitting}
      >
        {/* 基本信息 */}
        <Card type="inner" title={<><FileText className="inline mr-2" size={16} />基本信息</>} className="mb-6">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="出版物标题"
                name="title"
                rules={validationRules.title}
              >
                <Input 
                  placeholder="请输入出版物标题" 
                  showCount 
                  maxLength={300}
                  prefix={<FileText size={16} />}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="出版物类型"
                name="type"
                rules={[{ required: true, message: '请选择出版物类型' }]}
              >
                <Select placeholder="请选择出版物类型">
                  <Option value="journal">期刊论文</Option>
                  <Option value="conference">会议论文</Option>
                  <Option value="book">书籍</Option>
                  <Option value="chapter">书籍章节</Option>
                  <Option value="thesis">学位论文</Option>
                  <Option value="patent">专利</Option>
                  <Option value="report">技术报告</Option>
                  <Option value="preprint">预印本</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="发布状态"
                name="status"
                rules={[{ required: true, message: '请选择发布状态' }]}
              >
                <Select placeholder="请选择发布状态">
                  <Option value="published">已发表</Option>
                  <Option value="accepted">已接收</Option>
                  <Option value="submitted">已投稿</Option>
                  <Option value="in_review">审稿中</Option>
                  <Option value="draft">草稿</Option>
                  <Option value="rejected">被拒绝</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="可见性"
                name="visibility"
                rules={[{ required: true, message: '请选择可见性' }]}
              >
                <Select placeholder="请选择可见性">
                  <Option value="public">公开</Option>
                  <Option value="private">私有</Option>
                  <Option value="internal">内部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="featured" valuePropName="checked">
                <Checkbox>特色出版物</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="openAccess" valuePropName="checked">
                <Checkbox>开放获取</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="peerReviewed" valuePropName="checked">
                <Checkbox>同行评议</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 作者和机构信息 */}
        <Card type="inner" title={<><Users className="inline mr-2" size={16} />作者和机构信息</>} className="mb-6">
          <Form.Item label="作者" required>
            <Space.Compact style={{ display: 'flex' }}>
              <Input
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                onPressEnter={addAuthor}
                placeholder="输入作者姓名并按回车添加"
                prefix={<Users size={16} />}
                style={{ flex: 1 }}
              />
              <Button 
                type="primary" 
                onClick={addAuthor}
                disabled={!authorInput.trim()}
              >
                添加
              </Button>
            </Space.Compact>
          </Form.Item>
          
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
          
          <Form.Item label="机构">
            <Space.Compact style={{ display: 'flex' }}>
              <Input
                value={affiliationInput}
                onChange={(e) => setAffiliationInput(e.target.value)}
                onPressEnter={addAffiliation}
                placeholder="输入机构名称并按回车添加"
                prefix={<Building size={16} />}
                style={{ flex: 1 }}
              />
              <Button 
                type="primary" 
                onClick={addAffiliation}
                disabled={!affiliationInput.trim()}
              >
                添加
              </Button>
            </Space.Compact>
          </Form.Item>
          
          {affiliations.length > 0 && (
            <div className="mb-4">
              {affiliations.map((affiliation, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeAffiliation(index)}
                  color="orange"
                  className="mb-2"
                >
                  {affiliation}
                </Tag>
              ))}
            </div>
          )}
        </Card>

        {/* 摘要和关键词 */}
        <Card type="inner" title={<><FileText className="inline mr-2" size={16} />摘要和关键词</>} className="mb-6">
          <Form.Item
            label="摘要"
            name="abstract"
            rules={validationRules.abstract}
          >
            <TextArea 
              rows={6} 
              placeholder="请输入出版物摘要（100-2000字符）" 
              showCount 
              maxLength={2000}
            />
          </Form.Item>
          
          <Form.Item label="关键词">
            <Space.Compact style={{ display: 'flex' }}>
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onPressEnter={addKeyword}
                placeholder="输入关键词并按回车添加"
                prefix={<TagIcon size={16} />}
                style={{ flex: 1 }}
              />
              <Button 
                type="primary" 
                onClick={addKeyword}
                disabled={!keywordInput.trim()}
              >
                添加
              </Button>
            </Space.Compact>
          </Form.Item>
          
          {keywords.length > 0 && (
            <div className="mb-4">
              {keywords.map((keyword, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeKeyword(index)}
                  color="green"
                  className="mb-2"
                >
                  {keyword}
                </Tag>
              ))}
            </div>
          )}
          
          <Form.Item label="标签">
            <Space.Compact style={{ display: 'flex' }}>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPressEnter={addTag}
                placeholder="输入标签并按回车添加"
                prefix={<TagIcon size={16} />}
                style={{ flex: 1 }}
              />
              <Button 
                type="primary" 
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                添加
              </Button>
            </Space.Compact>
          </Form.Item>
          
          {tags.length > 0 && (
            <div className="mb-4">
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeTag(index)}
                  color="purple"
                  className="mb-2"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </Card>

        {/* 出版信息 */}
        <Card type="inner" title={<><BookOpen className="inline mr-2" size={16} />出版信息</>} className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="期刊" name="journal">
                <Input placeholder="期刊名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="会议" name="conference">
                <Input placeholder="会议名称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="出版商" name="publisher">
                <Input placeholder="出版商名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="会议地点" name="venue">
                <Input placeholder="会议举办地点" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="位置" name="location">
                <Input placeholder="具体位置" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="卷号" name="volume">
                <Input placeholder="卷号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="期号" name="issue">
                <Input placeholder="期号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="页码" name="pages">
                <Input placeholder="1-10" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                label="年份" 
                name="year"
                rules={validationRules.year}
              >
                <InputNumber 
                  min={1900} 
                  max={new Date().getFullYear() + 5} 
                  className="w-full" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="月份" name="month">
                <Select placeholder="选择月份">
                  <Option value="January">一月</Option>
                  <Option value="February">二月</Option>
                  <Option value="March">三月</Option>
                  <Option value="April">四月</Option>
                  <Option value="May">五月</Option>
                  <Option value="June">六月</Option>
                  <Option value="July">七月</Option>
                  <Option value="August">八月</Option>
                  <Option value="September">九月</Option>
                  <Option value="October">十月</Option>
                  <Option value="November">十一月</Option>
                  <Option value="December">十二月</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="影响因子" 
                name="impactFactor"
                rules={validationRules.impactFactor}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  step={0.001} 
                  precision={3}
                  className="w-full" 
                  prefix={<Award size={16} />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="期刊分区" name="quartile">
                <Select placeholder="选择期刊分区">
                  <Option value="Q1">Q1</Option>
                  <Option value="Q2">Q2</Option>
                  <Option value="Q3">Q3</Option>
                  <Option value="Q4">Q4</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 标识符和链接 */}
        <Card type="inner" title={<><Link className="inline mr-2" size={16} />标识符和链接</>} className="mb-6">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                label="DOI" 
                name="doi"
                rules={validationRules.doi}
              >
                <Input placeholder="10.1000/182" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="ISBN" 
                name="isbn"
                rules={validationRules.isbn}
              >
                <Input placeholder="978-3-16-148410-0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="ISSN" 
                name="issn"
                rules={validationRules.issn}
              >
                <Input placeholder="1234-5678" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="URL链接" 
                name="url"
                rules={validationRules.url}
              >
                <Input placeholder="https://example.com" prefix={<Link size={16} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="PDF链接" 
                name="pdfUrl"
                rules={validationRules.pdfUrl}
              >
                <Input placeholder="https://example.com/paper.pdf" prefix={<FileText size={16} />} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 时间信息 */}
        <Card type="inner" title={<><Calendar className="inline mr-2" size={16} />时间信息</>} className="mb-6">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="发表时间" name="publishDate">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="投稿时间" name="submissionDate">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="接收时间" name="acceptanceDate">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 统计信息 */}
        <Card type="inner" title={<><Eye className="inline mr-2" size={16} />统计信息</>} className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="引用次数" name="citationCount">
                <InputNumber min={0} className="w-full" prefix={<Award size={16} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="备注" name="note">
                <TextArea rows={3} placeholder="其他备注信息" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 操作按钮 */}
        <Form.Item>
          <Space>
            <Button onClick={onCancel} disabled={loading || isSubmitting}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading || isSubmitting}
            >
              {isEditing ? '更新出版物' : '添加出版物'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default PublicationForm