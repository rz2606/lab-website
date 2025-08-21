import React, { useState, useEffect } from 'react'
import { 
  Tag, 
  Space, 
  message,
  Card,
  Row,
  Col,
  Form,
  Input,
  Button
} from 'antd'
import { 
  ToolOutlined, 
  UserOutlined, 
  LinkOutlined, 
  FileTextOutlined,
  ActivityOutlined,
  TagOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type { Tool } from '@/types/admin'
import { UnifiedForm } from '../../common/UnifiedForm'
import { UnifiedFormField } from '../../common/UnifiedFormField'
import { LoadingSpinner } from '../common/LoadingSpinner'
import dayjs from 'dayjs'



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

  const [formData, setFormData] = useState<Partial<Tool>>({})
  const [tagInput, setTagInput] = useState('')
  const [authorInput, setAuthorInput] = useState('')
  const [maintainerInput, setMaintainerInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')
  const [screenshotInput, setScreenshotInput] = useState('')

  // 初始化表单数据
  useEffect(() => {
    setFormData(initialValues)
  }, [tool])

  // 准备初始值
  const initialValues = {
    name: tool?.name || '',
    description: tool?.description || '',
    shortDescription: tool?.shortDescription || '',
    version: tool?.version || '1.0.0',
    type: tool?.type || 'software',
    category: tool?.category || '',
    tags: tool?.tags || [],
    authors: tool?.authors || [],
    maintainers: tool?.maintainers || [],
    license: tool?.license || 'MIT',
    homepage: tool?.homepage || '',
    repository: tool?.repository || '',
    documentation: tool?.documentation || '',
    downloadUrl: tool?.downloadUrl || '',
    demoUrl: tool?.demoUrl || '',
    screenshots: tool?.screenshots || [],
    features: tool?.features || [],
    requirements: tool?.requirements || '',
    installation: tool?.installation || '',
    usage: tool?.usage || '',
    changelog: tool?.changelog || '',
    status: tool?.status || 'active',
    visibility: tool?.visibility || 'public',
    featured: tool?.featured || false,
    downloadCount: tool?.downloadCount || 0,
    starCount: tool?.starCount || 0,
    forkCount: tool?.forkCount || 0,
    issueCount: tool?.issueCount || 0,
    releaseDate: tool?.releaseDate ? dayjs(tool.releaseDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    lastUpdate: tool?.lastUpdate ? dayjs(tool.lastUpdate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  }

  // 添加标签
  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = formData.tags || []
      if (!currentTags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...currentTags, tagInput.trim()] }))
        setTagInput('')
      }
    }
  }

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags || []
    setFormData(prev => ({ ...prev, tags: currentTags.filter((tag: string) => tag !== tagToRemove) }))
  }

  // 添加作者
  const addAuthor = () => {
    if (authorInput.trim()) {
      const currentAuthors = formData.authors || []
      if (!currentAuthors.includes(authorInput.trim())) {
        setFormData(prev => ({ ...prev, authors: [...currentAuthors, authorInput.trim()] }))
        setAuthorInput('')
      }
    }
  }

  // 删除作者
  const removeAuthor = (authorToRemove: string) => {
    const currentAuthors = formData.authors || []
    setFormData(prev => ({ ...prev, authors: currentAuthors.filter((author: string) => author !== authorToRemove) }))
  }

  // 添加维护者
  const addMaintainer = () => {
    if (maintainerInput.trim()) {
      const currentMaintainers = formData.maintainers || []
      if (!currentMaintainers.includes(maintainerInput.trim())) {
        setFormData(prev => ({ ...prev, maintainers: [...currentMaintainers, maintainerInput.trim()] }))
        setMaintainerInput('')
      }
    }
  }

  // 删除维护者
  const removeMaintainer = (maintainerToRemove: string) => {
    const currentMaintainers = formData.maintainers || []
    setFormData(prev => ({ ...prev, maintainers: currentMaintainers.filter((maintainer: string) => maintainer !== maintainerToRemove) }))
  }

  // 添加功能特性
  const addFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = formData.features || []
      if (!currentFeatures.includes(featureInput.trim())) {
        setFormData(prev => ({ ...prev, features: [...currentFeatures, featureInput.trim()] }))
        setFeatureInput('')
      }
    }
  }

  // 删除功能特性
  const removeFeature = (featureToRemove: string) => {
    const currentFeatures = formData.features || []
    setFormData(prev => ({ ...prev, features: currentFeatures.filter((feature: string) => feature !== featureToRemove) }))
  }

  // 添加截图
  const addScreenshot = () => {
    if (screenshotInput.trim()) {
      try {
        new URL(screenshotInput.trim())
        const currentScreenshots = formData.screenshots || []
        if (!currentScreenshots.includes(screenshotInput.trim())) {
          setFormData(prev => ({ ...prev, screenshots: [...currentScreenshots, screenshotInput.trim()] }))
          setScreenshotInput('')
        }
      } catch {
        message.error('请输入有效的URL')
      }
    }
  }

  // 删除截图
  const removeScreenshot = (screenshotToRemove: string) => {
    const currentScreenshots = formData.screenshots || []
    setFormData(prev => ({ ...prev, screenshots: currentScreenshots.filter((screenshot: string) => screenshot !== screenshotToRemove) }))
  }

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      // 验证日期
      if (values.lastUpdate && values.releaseDate && new Date(values.lastUpdate) < new Date(values.releaseDate)) {
        message.error('最后更新时间不能早于发布时间')
        return
      }

      const submitData = {
        ...values,
        id: tool?.id || Date.now().toString(),
        createdAt: tool?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await onSubmit(submitData)
      message.success(tool ? '工具更新成功' : '工具创建成功')
      onCancel()
    } catch (error) {
      console.error('提交失败:', error)
      message.error('提交失败，请检查表单数据')
    }
  }

  const isEditing = !!tool

  const validationRules = {
    name: [
      { required: true, message: '请输入工具名称' },
      { min: 2, message: '工具名称至少2个字符' }
    ],
    shortDescription: [
      { required: true, message: '请输入简短描述' },
      { max: 200, message: '简短描述不能超过200个字符' }
    ],
    type: [{ required: true, message: '请选择类型' }],
    version: [
      { required: true, message: '请输入版本号' },
      { pattern: /^\d+\.\d+\.\d+/, message: '版本号格式不正确（如：1.0.0）' }
    ],
    status: [{ required: true, message: '请选择状态' }],
    visibility: [{ required: true, message: '请选择可见性' }],
    description: [
      { required: true, message: '请输入详细描述' },
      { min: 10, message: '详细描述至少10个字符' }
    ],
    homepage: [{ type: 'url', message: '请输入有效的URL' }],
    repository: [{ type: 'url', message: '请输入有效的URL' }],
    documentation: [{ type: 'url', message: '请输入有效的URL' }],
    downloadUrl: [{ type: 'url', message: '请输入有效的URL' }],
    demoUrl: [{ type: 'url', message: '请输入有效的URL' }],
    releaseDate: [{ required: true, message: '请选择发布日期' }],
    lastUpdate: [{ required: true, message: '请选择最后更新日期' }]
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <UnifiedForm
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationRules={validationRules}
      className="max-w-4xl mx-auto"
    >
      {/* 基本信息 */}
      <Card title={<><ToolOutlined /> 基本信息</>} className="mb-6">
        <Row gutter={16}>
          <Col span={24}>
            <UnifiedFormField
              label="工具名称"
              name="name"
              type="input"
              placeholder="请输入工具名称"
              prefix={<ToolOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <UnifiedFormField
              label="简短描述"
              name="shortDescription"
              type="textarea"
              placeholder="请输入简短描述（不超过200字符）"
              rows={3}
              showCount
              maxLength={200}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <UnifiedFormField
              label="类型"
              name="type"
              type="select"
              placeholder="请选择类型"
              options={[
                { value: 'software', label: '软件工具' },
                { value: 'dataset', label: '数据集' },
                { value: 'model', label: '模型' },
                { value: 'library', label: '库' },
                { value: 'framework', label: '框架' },
                { value: 'api', label: 'API' }
              ]}
            />
          </Col>
          <Col xs={24} md={8}>
            <UnifiedFormField
              label="版本号"
              name="version"
              type="input"
              placeholder="如：1.0.0"
              prefix={<TagOutlined />}
            />
          </Col>
          <Col xs={24} md={8}>
            <UnifiedFormField
              label="状态"
              name="status"
              type="select"
              placeholder="请选择状态"
              options={[
                { value: 'active', label: '活跃' },
                { value: 'maintenance', label: '维护中' },
                { value: 'deprecated', label: '已弃用' },
                { value: 'beta', label: '测试版' },
                { value: 'alpha', label: '内测版' }
              ]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="分类"
              name="category"
              type="input"
              placeholder="如：机器学习、数据分析"
              prefix={<AppstoreOutlined />}
            />
          </Col>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="许可证"
              name="license"
              type="input"
              placeholder="如：MIT、Apache-2.0"
              prefix={<FileTextOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="可见性"
              name="visibility"
              type="select"
              placeholder="请选择可见性"
              options={[
                { value: 'public', label: '公开' },
                { value: 'internal', label: '内部' },
                { value: 'private', label: '私有' }
              ]}
            />
          </Col>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="特色工具"
              name="featured"
              type="checkbox"
              checkboxLabel={<><StarOutlined /> 设为特色工具</>}
            />
          </Col>
        </Row>

        {/* 标签管理 */}
        <Form.Item label="标签">
          <Space.Compact style={{ display: 'flex' }}>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onPressEnter={addTag}
              placeholder="输入标签并按回车添加"
            />
            <Button 
              type="primary" 
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              添加
            </Button>
          </Space.Compact>
          <div style={{ marginTop: 8 }}>
            {(formData.tags || []).map((tag: string, index: number) => (
              <Tag
                key={index}
                closable
                onClose={() => removeTag(tag)}
                style={{ marginBottom: 4 }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </Form.Item>
      </Card>

      {/* 人员信息 */}
      <Card title={<><TeamOutlined /> 人员信息</>} className="mb-6">
        {/* 作者 */}
        <Form.Item label="作者" required>
          <Space.Compact style={{ display: 'flex' }}>
            <Input
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onPressEnter={addAuthor}
              placeholder="输入作者姓名并按回车添加"
            />
            <Button 
              type="primary" 
              onClick={addAuthor}
              disabled={!authorInput.trim()}
            >
              添加
            </Button>
          </Space.Compact>
          <div style={{ marginTop: 8 }}>
            {(formData.authors || []).map((author: string, index: number) => (
              <Tag
                key={index}
                closable
                onClose={() => removeAuthor(author)}
                color="blue"
                style={{ marginBottom: 4 }}
              >
                <UserOutlined /> {author}
              </Tag>
            ))}
          </div>
        </Form.Item>

        {/* 维护者 */}
        <Form.Item label="维护者">
          <Space.Compact style={{ display: 'flex' }}>
            <Input
              value={maintainerInput}
              onChange={(e) => setMaintainerInput(e.target.value)}
              onPressEnter={addMaintainer}
              placeholder="输入维护者姓名并按回车添加"
            />
            <Button 
              type="primary" 
              onClick={addMaintainer}
              disabled={!maintainerInput.trim()}
            >
              添加
            </Button>
          </Space.Compact>
          <div style={{ marginTop: 8 }}>
            {(formData.maintainers || []).map((maintainer: string, index: number) => (
              <Tag
                key={index}
                closable
                onClose={() => removeMaintainer(maintainer)}
                color="green"
                style={{ marginBottom: 4 }}
              >
                <UserOutlined /> {maintainer}
              </Tag>
            ))}
          </div>
        </Form.Item>
      </Card>

      {/* 链接信息 */}
      <Card title={<><LinkOutlined /> 链接信息</>} className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="主页"
              name="homepage"
              type="input"
              placeholder="https://example.com"
              prefix={<LinkOutlined />}
            />
          </Col>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="代码仓库"
              name="repository"
              type="input"
              placeholder="https://github.com/user/repo"
              prefix={<GithubOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="文档"
              name="documentation"
              type="input"
              placeholder="https://docs.example.com"
              prefix={<FileTextOutlined />}
            />
          </Col>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="下载链接"
              name="downloadUrl"
              type="input"
              placeholder="https://download.example.com"
              prefix={<DownloadOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="演示链接"
              name="demoUrl"
              type="input"
              placeholder="https://demo.example.com"
              prefix={<LinkOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* 详细信息 */}
      <Card title={<><FileTextOutlined /> 详细信息</>} className="mb-6">
        <UnifiedFormField
          label="详细描述"
          name="description"
          type="textarea"
          placeholder="请输入详细描述"
          rows={6}
          showCount
        />

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="系统要求"
              name="requirements"
              type="textarea"
              placeholder="请输入系统要求"
              rows={4}
            />
          </Col>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="安装说明"
              name="installation"
              type="textarea"
              placeholder="请输入安装说明"
              rows={4}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="使用说明"
              name="usage"
              type="textarea"
              placeholder="请输入使用说明"
              rows={4}
            />
          </Col>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="更新日志"
              name="changelog"
              type="textarea"
              placeholder="请输入更新日志"
              rows={4}
            />
          </Col>
        </Row>

        {/* 功能特性 */}
        <Form.Item label="功能特性">
          <Space.Compact style={{ display: 'flex' }}>
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onPressEnter={addFeature}
              placeholder="输入功能特性并按回车添加"
            />
            <Button 
              type="primary" 
              onClick={addFeature}
              disabled={!featureInput.trim()}
            >
              添加
            </Button>
          </Space.Compact>
          <div style={{ marginTop: 8 }}>
            {(formData.features || []).map((feature: string, index: number) => (
              <Tag
                key={index}
                closable
                onClose={() => removeFeature(feature)}
                color="purple"
                style={{ marginBottom: 4 }}
              >
                {feature}
              </Tag>
            ))}
          </div>
        </Form.Item>

        {/* 截图 */}
        <Form.Item label="截图">
          <Space.Compact style={{ display: 'flex' }}>
            <Input
              value={screenshotInput}
              onChange={(e) => setScreenshotInput(e.target.value)}
              onPressEnter={addScreenshot}
              placeholder="输入截图URL并按回车添加"
            />
            <Button 
              type="primary" 
              onClick={addScreenshot}
              disabled={!screenshotInput.trim()}
            >
              添加
            </Button>
          </Space.Compact>
          <div style={{ marginTop: 8 }}>
            {(formData.screenshots || []).map((screenshot: string, index: number) => (
              <Tag
                key={index}
                closable
                onClose={() => removeScreenshot(screenshot)}
                color="orange"
                style={{ marginBottom: 4 }}
              >
                {screenshot}
              </Tag>
            ))}
          </div>
        </Form.Item>
      </Card>

      {/* 统计信息 */}
      <Card title={<><ActivityOutlined /> 统计信息</>} className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <UnifiedFormField
              label="下载次数"
              name="downloadCount"
              type="number"
              min={0}
            />
          </Col>
          <Col xs={24} md={6}>
            <UnifiedFormField
              label="星标数"
              name="starCount"
              type="number"
              min={0}
            />
          </Col>
          <Col xs={24} md={6}>
            <UnifiedFormField
              label="分支数"
              name="forkCount"
              type="number"
              min={0}
            />
          </Col>
          <Col xs={24} md={6}>
            <UnifiedFormField
              label="问题数"
              name="issueCount"
              type="number"
              min={0}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="发布日期"
              name="releaseDate"
              type="date"
            />
          </Col>
          <Col xs={24} md={12}>
            <UnifiedFormField
              label="最后更新"
              name="lastUpdate"
              type="date"
            />
          </Col>
        </Row>
      </Card>

      {/* 提交按钮 */}
      <Form.Item>
        <Space>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large"
          >
            {isEditing ? '更新工具' : '创建工具'}
          </Button>
          <Button 
            onClick={onCancel} 
            size="large"
          >
            取消
          </Button>
        </Space>
      </Form.Item>
    </UnifiedForm>
  )
}

export default ToolForm