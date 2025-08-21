import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Card, DatePicker, Space, Tag, Row, Col, message, Divider } from 'antd'
import { User, Users, Mail, Phone, Globe, Github, Linkedin, Twitter, Calendar, Plus, X } from 'lucide-react'
import { TeamMember } from '@/types/team'
import { LoadingSpinner } from '../common/LoadingSpinner'
import dayjs from 'dayjs'

interface TeamMemberFormProps {
  member?: TeamMember | null
  onSubmit: (memberData: Partial<TeamMember>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const { TextArea } = Input
const { Option } = Select

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  member,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [researchInterests, setResearchInterests] = useState<string[]>([])
  const [researchInput, setResearchInput] = useState('')

  // 初始化表单数据
  useEffect(() => {
    if (member) {
      const formData = {
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        position: member.position || '',
        department: member.department || '',
        type: member.type || 'faculty',
        bio: member.bio || '',
        avatar: member.avatar || '',
        website: member.website || '',
        github: member.github || '',
        linkedin: member.linkedin || '',
        twitter: member.twitter || '',
        education: member.education || '',
        joinDate: member.joinDate ? dayjs(member.joinDate) : null,
        status: member.status || 'active'
      }
      form.setFieldsValue(formData)
      setResearchInterests(member.researchInterests || [])
    } else {
      form.resetFields()
      setResearchInterests([])
    }
  }, [member, form])

  // URL验证函数
  const validateUrl = (_: unknown, value: string) => {
    if (!value) return Promise.resolve()
    try {
      new URL(value)
      return Promise.resolve()
    } catch {
      return Promise.reject(new Error('请输入有效的URL地址'))
    }
  }

  // 添加研究兴趣
  const addResearchInterest = () => {
    if (researchInput.trim() && !researchInterests.includes(researchInput.trim())) {
      setResearchInterests([...researchInterests, researchInput.trim()])
      setResearchInput('')
    }
  }

  // 删除研究兴趣
  const removeResearchInterest = (index: number) => {
    setResearchInterests(researchInterests.filter((_, i) => i !== index))
  }

  // 处理表单提交
  const handleSubmit = async (values: Record<string, unknown>) => {
    setIsSubmitting(true)
    try {
      const submitData: Partial<TeamMember> = {
        name: values.name?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim() || undefined,
        position: values.position?.trim(),
        department: values.department?.trim(),
        type: values.type,
        bio: values.bio?.trim() || undefined,
        avatar: values.avatar?.trim() || undefined,
        website: values.website?.trim() || undefined,
        github: values.github?.trim() || undefined,
        linkedin: values.linkedin?.trim() || undefined,
        twitter: values.twitter?.trim() || undefined,
        researchInterests: researchInterests.length > 0 ? researchInterests : undefined,
        education: values.education?.trim() || undefined,
        joinDate: values.joinDate ? values.joinDate.toISOString() : undefined,
        status: values.status
      }

      await onSubmit(submitData)
      message.success(member ? '团队成员更新成功' : '团队成员添加成功')
    } catch (error) {
      console.error('提交团队成员表单失败:', error)
      message.error('操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!member

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Card title={isEditing ? '编辑团队成员' : '添加团队成员'} className="w-full">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isSubmitting}
        className="space-y-6"
      >
        {/* 基本信息 */}
        <Card type="inner" title={<><User className="h-4 w-4 mr-2 inline" />基本信息</>} className="mb-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { min: 2, message: '姓名至少需要2个字符' }
                ]}
              >
                <Input
                  prefix={<User className="h-4 w-4" />}
                  placeholder="请输入姓名"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<Mail className="h-4 w-4" />}
                  placeholder="请输入邮箱地址"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                ]}
              >
                <Input
                  prefix={<Phone className="h-4 w-4" />}
                  placeholder="请输入手机号码"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="avatar"
                label="头像URL"
                rules={[{ validator: validateUrl }]}
              >
                <Input placeholder="请输入头像图片URL" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 职位信息 */}
        <Card type="inner" title={<><Users className="h-4 w-4 mr-2 inline" />职位信息</>} className="mb-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="position"
                label="职位"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请输入部门' }]}
              >
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="成员类型"
                initialValue="faculty"
              >
                <Select placeholder="请选择成员类型">
                  <Option value="faculty">教职工</Option>
                  <Option value="student">学生</Option>
                  <Option value="postdoc">博士后</Option>
                  <Option value="visiting">访问学者</Option>
                  <Option value="alumni">校友</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="joinDate"
                label="入职日期"
              >
                <DatePicker
                  className="w-full"
                  placeholder="请选择入职日期"
                  suffixIcon={<Calendar className="h-4 w-4" />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="状态"
                initialValue="active"
              >
                <Select placeholder="请选择状态">
                  <Option value="active">在职</Option>
                  <Option value="inactive">离职</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 详细信息 */}
        <Card type="inner" title="详细信息" className="mb-6">
          <Form.Item
            name="bio"
            label="个人简介"
          >
            <TextArea
              rows={4}
              placeholder="请输入个人简介"
            />
          </Form.Item>

          <Form.Item
            name="education"
            label="教育背景"
          >
            <TextArea
              rows={3}
              placeholder="请输入教育背景"
            />
          </Form.Item>

          {/* 研究兴趣 */}
          <Form.Item label="研究兴趣">
            <Space.Compact className="w-full">
              <Input
                value={researchInput}
                onChange={(e) => setResearchInput(e.target.value)}
                onPressEnter={addResearchInterest}
                placeholder="输入研究兴趣并按回车添加"
                className="flex-1"
              />
              <Button
                type="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={addResearchInterest}
                disabled={!researchInput.trim()}
              >
                添加
              </Button>
            </Space.Compact>
            {researchInterests.length > 0 && (
              <div className="mt-2 space-y-2">
                {researchInterests.map((interest, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => removeResearchInterest(index)}
                    closeIcon={<X className="h-3 w-3" />}
                    className="mb-1"
                  >
                    {interest}
                  </Tag>
                ))}
              </div>
            )}
          </Form.Item>
        </Card>

        {/* 社交链接 */}
        <Card type="inner" title={<><Globe className="h-4 w-4 mr-2 inline" />社交链接</>} className="mb-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="website"
                label="个人网站"
                rules={[{ validator: validateUrl }]}
              >
                <Input
                  prefix={<Globe className="h-4 w-4" />}
                  placeholder="https://example.com"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="github"
                label="GitHub"
                rules={[{ validator: validateUrl }]}
              >
                <Input
                  prefix={<Github className="h-4 w-4" />}
                  placeholder="https://github.com/username"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="linkedin"
                label="LinkedIn"
                rules={[{ validator: validateUrl }]}
              >
                <Input
                  prefix={<Linkedin className="h-4 w-4" />}
                  placeholder="https://linkedin.com/in/username"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="twitter"
                label="Twitter"
                rules={[{ validator: validateUrl }]}
              >
                <Input
                  prefix={<Twitter className="h-4 w-4" />}
                  placeholder="https://twitter.com/username"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 操作按钮 */}
        <Divider />
        <div className="flex justify-end space-x-3">
          <Button onClick={onCancel} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            icon={isSubmitting ? undefined : (isEditing ? undefined : <Plus className="h-4 w-4" />)}
          >
            {isEditing ? '更新成员' : '添加成员'}
          </Button>
        </div>
      </Form>
    </Card>
  )
}

export default TeamMemberForm