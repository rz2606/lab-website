'use client'

import React, { useState } from 'react'
import { Table, Button, Form, Input, Select, Upload, message, Modal, Avatar, Space, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'

interface Researcher {
  id: number
  name: string
  photo?: string
  email?: string
  direction?: string
  type: string
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

interface ResearcherManagementProps {
  researchers: Researcher[]
  onDataRefresh: () => void
  loading: boolean
}

const ResearcherManagement: React.FC<ResearcherManagementProps> = ({ 
  researchers, 
  onDataRefresh, 
  loading 
}) => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingResearcher, setEditingResearcher] = useState<Researcher | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

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

  // 打开添加/编辑模态框
  const handleOpenModal = (researcher?: Researcher) => {
    setEditingResearcher(researcher || null)
    setIsModalVisible(true)
    setFileList([])
    
    if (researcher) {
      form.setFieldsValue(researcher)
    } else {
      form.resetFields()
    }
  }

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalVisible(false)
    setEditingResearcher(null)
    setFileList([])
    form.resetFields()
  }

  // 保存研究人员
  const handleSave = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      
      // 处理图片上传
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const photoUrl = await handleUpload(fileList[0].originFileObj)
        values.photo = photoUrl
      }
      
      const url = editingResearcher 
        ? `/api/team/researchers/${editingResearcher.id}`
        : '/api/team/researchers'
      
      const method = editingResearcher ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) {
        throw new Error('保存失败')
      }
      
      message.success(`${editingResearcher ? '更新' : '添加'}研究人员成功`)
      handleCloseModal()
      onDataRefresh()
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除研究人员
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/team/researchers/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('删除失败')
      }
      
      message.success('删除研究人员成功')
      onDataRefresh()
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }

  // 表格列定义
  const columns: ColumnsType<Researcher> = [
    {
      title: '头像',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo: string) => (
        <Avatar 
          size={40} 
          src={photo} 
          icon={<UserOutlined />}
        />
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '研究方向',
      dataIndex: 'direction',
      key: 'direction'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          researcher: '研究人员',
          postdoc: '博士后'
        }
        return typeMap[type] || type
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个研究人员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">研究人员管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          添加研究人员
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={researchers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingResearcher ? '编辑研究人员' : '添加研究人员'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        confirmLoading={submitting}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
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
          
          <Form.Item
            name="direction"
            label="研究方向"
          >
            <Input placeholder="请输入研究方向" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="类型"
            initialValue="researcher"
          >
            <Select>
              <Select.Option value="researcher">研究人员</Select.Option>
              <Select.Option value="postdoc">博士后</Select.Option>
            </Select>
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
        </Form>
      </Modal>
    </div>
  )
}

export default ResearcherManagement