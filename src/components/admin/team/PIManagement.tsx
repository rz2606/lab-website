'use client'

import React, { useState } from 'react'
import { Card, Button, Form, Input, Upload, message, Spin, Avatar, Descriptions } from 'antd'
import { EditOutlined, SaveOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'

interface PIData {
  id?: number
  name: string
  photo?: string
  title?: string
  email?: string
  experience?: string
  positions?: string
  awards?: string
  papers?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: number
  updatedBy?: number
}

interface PIManagementProps {
  piData: PIData | null
  onDataRefresh: () => void
  loading: boolean
}

const PIManagement: React.FC<PIManagementProps> = ({ piData, onDataRefresh, loading }) => {
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // 初始化表单数据
  React.useEffect(() => {
    if (piData) {
      form.setFieldsValue(piData)
    }
  }, [piData, form])

  // 处理文件上传
  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('上传失败')
      }
      
      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('上传失败:', error)
      message.error('图片上传失败')
      throw error
    }
  }

  // 保存PI信息
  const handleSave = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      
      // 处理图片上传
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const photoUrl = await handleUpload(fileList[0].originFileObj)
        values.photo = photoUrl
      }
      
      const response = await fetch('/api/team/pi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) {
        throw new Error('保存失败')
      }
      
      message.success('PI信息保存成功')
      setIsEditing(false)
      setFileList([])
      onDataRefresh()
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false)
    setFileList([])
    if (piData) {
      form.setFieldsValue(piData)
    } else {
      form.resetFields()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">负责人信息</h2>
        {!isEditing ? (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            编辑
          </Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={handleSave}
            >
              保存
            </Button>
          </div>
        )}
      </div>

      {!isEditing && piData ? (
        // 展示模式
        <Card>
          <div className="flex items-start space-x-6">
            <Avatar 
              size={120} 
              src={piData.photo} 
              icon={<UserOutlined />}
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <Descriptions column={1} labelStyle={{ fontWeight: 'bold' }}>
                <Descriptions.Item label="姓名">{piData.name}</Descriptions.Item>
                <Descriptions.Item label="职称">{piData.title}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{piData.email}</Descriptions.Item>
                {piData.experience && (
                  <Descriptions.Item label="工作经历">
                    <div className="whitespace-pre-wrap">{piData.experience}</div>
                  </Descriptions.Item>
                )}
                {piData.positions && (
                  <Descriptions.Item label="社会兼职">
                    <div className="whitespace-pre-wrap">{piData.positions}</div>
                  </Descriptions.Item>
                )}
                {piData.awards && (
                  <Descriptions.Item label="学术奖项">
                    <div className="whitespace-pre-wrap">{piData.awards}</div>
                  </Descriptions.Item>
                )}
                {piData.papers && (
                  <Descriptions.Item label="代表性论文">
                    <div className="whitespace-pre-wrap">{piData.papers}</div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </div>
        </Card>
      ) : (
        // 编辑模式
        <Card>
          <Form
            form={form}
            layout="vertical"
            initialValues={piData || {}}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入姓名" />
                </Form.Item>
                
                <Form.Item
                  name="title"
                  label="职称"
                  rules={[{ required: true, message: '请输入职称' }]}
                >
                  <Input placeholder="请输入职称" />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
                
                <Form.Item label="头像">
                  <Upload
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    beforeUpload={() => false}
                    maxCount={1}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />}>选择图片</Button>
                  </Upload>
                </Form.Item>
              </div>
              
              <div>
                <Form.Item
                  name="experience"
                  label="工作经历"
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="请输入工作经历" 
                  />
                </Form.Item>
                
                <Form.Item
                  name="positions"
                  label="社会兼职"
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="请输入社会兼职" 
                  />
                </Form.Item>
                
                <Form.Item
                  name="awards"
                  label="学术奖项"
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="请输入学术奖项" 
                  />
                </Form.Item>
                
                <Form.Item
                  name="papers"
                  label="代表性论文"
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="请输入代表性论文" 
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Card>
      )}
      
      {!piData && !isEditing && (
        <Card>
          <div className="text-center py-12">
            <UserOutlined className="text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">暂无负责人信息</p>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              添加负责人信息
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default PIManagement