import React, { useState, useEffect, useMemo } from 'react'
import { 
  Tag, 
  Space, 
  message,
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Select
} from 'antd'
import { 
  ToolOutlined, 
  UserOutlined, 
  LinkOutlined, 
  FileTextOutlined,
  BarChartOutlined,
  TagOutlined,
  TeamOutlined,
  AppstoreOutlined,
  StarOutlined,
  GithubOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import type { Tool } from '@/types/admin'
import UnifiedForm from '../../common/UnifiedForm'
import UnifiedFormField from '../../common/UnifiedFormField'
import LoadingSpinner from '../common/LoadingSpinner'
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
  // 准备初始值
  const initialValues = useMemo(() => ({
    name: tool?.name || '',
    description: tool?.description || '',
    shortDescription: tool?.shortDescription || '',
    version: tool?.version || '1.0.0',
    type: tool?.type || 'software',
    category: tool?.category || '',
    tags: tool?.tags || '',
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
    downloads: tool?.downloads || 0,
    starCount: tool?.starCount || 0,
    forkCount: tool?.forkCount || 0,
    issueCount: tool?.issueCount || 0,
    releaseDate: tool?.releaseDate && typeof tool.releaseDate === 'string' && tool.releaseDate.trim() ? dayjs(tool.releaseDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    lastUpdate: tool?.lastUpdate && typeof tool.lastUpdate === 'string' && tool.lastUpdate.trim() ? dayjs(tool.lastUpdate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  }), [tool])

  useEffect(() => {
    setFormData(initialValues)
  }, [initialValues])

  // 添加标签
  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      if (!currentTags.includes(tagInput.trim())) {
        const newTags = [...currentTags, tagInput.trim()].join(',')
        setFormData(prev => ({ ...prev, tags: newTags }))
        setTagInput('')
      }
    }
  }

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    const newTags = currentTags.filter(tag => tag !== tagToRemove).join(',')
    setFormData(prev => ({ ...prev, tags: newTags }))
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
  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      // 验证日期
      if (values.lastUpdate && values.releaseDate) {
        const releaseDate = new Date(values.releaseDate as string)
        const lastUpdate = new Date(values.lastUpdate as string)
        
        if (lastUpdate < releaseDate) {
          message.error('最后更新时间不能早于发布时间')
          return
        }
      }

      await onSubmit(values)
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
    <Form
      onFinish={handleSubmit}
      initialValues={initialValues}
      layout="vertical"
      className="max-w-4xl mx-auto"
    >
      {/* 基本信息 */}
      <Card title={<><ToolOutlined /> 基本信息</>} className="mb-6">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="工具名称"
              name="name"
              rules={[
                { required: true, message: '请输入工具名称' },
                { min: 2, message: '工具名称至少2个字符' }
              ]}
            >
              <Input placeholder="请输入工具名称" prefix={<ToolOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="简短描述"
              name="shortDescription"
              rules={[
                { required: true, message: '请输入简短描述' },
                { max: 200, message: '简短描述不能超过200个字符' }
              ]}
            >
              <Input.TextArea 
                placeholder="请输入简短描述（不超过200字符）" 
                rows={3} 
                showCount 
                maxLength={200} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="类型"
              name="type"
              rules={[{ required: true, message: '请选择类型' }]}
            >
              <Select placeholder="请选择类型">
                <Select.Option value="software">软件工具</Select.Option>
                <Select.Option value="library">程序库</Select.Option>
                <Select.Option value="framework">框架</Select.Option>
                <Select.Option value="database">数据库</Select.Option>
                <Select.Option value="api">API接口</Select.Option>
                <Select.Option value="service">在线服务</Select.Option>
                <Select.Option value="plugin">插件</Select.Option>
                <Select.Option value="extension">扩展</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="版本号"
              name="version"
              rules={[
                { required: true, message: '请输入版本号' },
                { pattern: /^\d+\.\d+\.\d+/, message: '版本号格式不正确（如：1.0.0）' }
              ]}
            >
              <Input placeholder="如：1.0.0" prefix={<TagOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Select.Option value="active">活跃</Select.Option>
                <Select.Option value="inactive">不活跃</Select.Option>
                <Select.Option value="deprecated">已弃用</Select.Option>
                <Select.Option value="beta">测试版</Select.Option>
                <Select.Option value="alpha">内测版</Select.Option>
                <Select.Option value="stable">稳定版</Select.Option>
                <Select.Option value="maintenance">维护中</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="分类"
              name="category"
            >
              <Input placeholder="如：机器学习、数据分析" prefix={<AppstoreOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="许可证"
              name="license"
            >
              <Input placeholder="如：MIT、Apache-2.0" prefix={<FileTextOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="可见性"
              name="visibility"
              rules={[{ required: true, message: '请选择可见性' }]}
            >
              <Select placeholder="请选择可见性">
                <Select.Option value="public">公开</Select.Option>
                <Select.Option value="private">私有</Select.Option>
                <Select.Option value="internal">内部</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="特色工具"
              name="featured"
              valuePropName="checked"
            >
              <Input type="checkbox" />
            </Form.Item>
          </Col>
        </Row>

        {/* 标签管理 */}
        <Form.Item label="标签">
          {/* 预设标签选择 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8, fontSize: '14px', color: '#666' }}>常用标签：</div>
            <Space wrap>
              {[
                '蛋白质结构', '结构比对', '相似性分析', '生物信息学',
                'Python', '分子筛选', '负向设计', '数据库构建',
                '分子数据库', '化学信息', '数据管理', '检索分析',
                '人工智能', '药物活性', '预测模型', '机器学习'
              ].map((presetTag) => {
                const isSelected = formData.tags && formData.tags.split(',').map(t => t.trim()).includes(presetTag)
                return (
                  <Tag
                    key={presetTag}
                    color={isSelected ? 'blue' : 'default'}
                    style={{ 
                      cursor: 'pointer',
                      marginBottom: 4,
                      border: isSelected ? '1px solid #1890ff' : '1px solid #d9d9d9'
                    }}
                    onClick={() => {
                      if (isSelected) {
                        removeTag(presetTag)
                      } else {
                        const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
                        if (!currentTags.includes(presetTag)) {
                          const newTags = [...currentTags, presetTag].join(',')
                          setFormData(prev => ({ ...prev, tags: newTags }))
                        }
                      }
                    }}
                  >
                    {presetTag}
                  </Tag>
                )
              })}
            </Space>
          </div>
          
          {/* 自定义标签输入 */}
          <Space.Compact style={{ display: 'flex' }}>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onPressEnter={addTag}
              placeholder="输入自定义标签并按回车添加"
            />
            <Button 
              type="primary" 
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              添加
            </Button>
          </Space.Compact>
          
          {/* 已选标签显示 */}
          <div style={{ marginTop: 8 }}>
            {formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).map((tag: string, index: number) => (
              <Tag
                key={index}
                closable
                onClose={() => removeTag(tag)}
                color="processing"
                style={{ marginBottom: 4 }}
              >
                {tag}
              </Tag>
            )) : null}
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
            <Form.Item
              label="主页"
              name="homepage"
              rules={[{ type: 'url', message: '请输入有效的URL' }]}
            >
              <Input placeholder="https://example.com" prefix={<LinkOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="代码仓库"
              name="repository"
              rules={[{ type: 'url', message: '请输入有效的URL' }]}
            >
              <Input placeholder="https://github.com/user/repo" prefix={<GithubOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="文档"
              name="documentation"
              rules={[{ type: 'url', message: '请输入有效的URL' }]}
            >
              <Input placeholder="https://docs.example.com" prefix={<FileTextOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="下载链接"
              name="downloadUrl"
              rules={[{ type: 'url', message: '请输入有效的URL' }]}
            >
              <Input placeholder="https://download.example.com" prefix={<DownloadOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="演示链接"
              name="demoUrl"
              rules={[{ type: 'url', message: '请输入有效的URL' }]}
            >
              <Input placeholder="https://demo.example.com" prefix={<LinkOutlined />} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 详细信息 */}
      <Card title={<><FileTextOutlined /> 详细信息</>} className="mb-6">
        <Form.Item
          label="详细描述"
          name="description"
          rules={[
            { required: true, message: '请输入详细描述' },
            { min: 10, message: '详细描述至少10个字符' }
          ]}
        >
          <Input.TextArea placeholder="请输入详细描述" rows={6} showCount />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="系统要求"
              name="requirements"
            >
              <Input.TextArea placeholder="请输入系统要求" rows={4} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="安装说明"
              name="installation"
            >
              <Input.TextArea placeholder="请输入安装说明" rows={4} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="使用说明"
              name="usage"
            >
              <Input.TextArea placeholder="请输入使用说明" rows={4} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="更新日志"
              name="changelog"
            >
              <Input.TextArea placeholder="请输入更新日志" rows={4} />
            </Form.Item>
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
      <Card title={<><BarChartOutlined /> 统计信息</>} className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Form.Item
              label="下载次数"
              name="downloads"
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label="星标数"
              name="stars"
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label="分支数"
              name="forks"
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label="问题数"
              name="issues"
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="发布日期"
              name="releaseDate"
              rules={[{ required: true, message: '请选择发布日期' }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="最后更新"
              name="lastUpdate"
              rules={[{ required: true, message: '请选择最后更新日期' }]}
            >
              <Input type="date" />
            </Form.Item>
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
    </Form>
  )
}

export default ToolForm