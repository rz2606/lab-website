'use client'

import React, { useState } from 'react'
import { Table, Button, Form, Input, InputNumber, Select, message, Modal, Space, Popconfirm, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import * as XLSX from 'xlsx'

interface Graduate {
  id: number
  serialNumber?: string
  name: string
  enrollmentDate?: string
  graduationDate?: string
  advisor?: string
  degree?: string
  discipline?: string
  thesisTitle?: string
  remarks?: string
  hasPaper?: boolean
  position?: string
  email?: string
  company?: string
  graduationYear?: number
  createdAt: string
  updatedAt: string
}

interface GraduateManagementProps {
  graduates: Graduate[]
  onDataRefresh: () => void
  loading: boolean
}

const GraduateManagement: React.FC<GraduateManagementProps> = ({ 
  graduates, 
  onDataRefresh, 
  loading 
}) => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingGraduate, setEditingGraduate] = useState<Graduate | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')

  // 打开添加/编辑模态框
  const handleOpenModal = (graduate?: Graduate) => {
    setEditingGraduate(graduate || null)
    setIsModalVisible(true)
    
    if (graduate) {
      form.setFieldsValue(graduate)
    } else {
      form.resetFields()
    }
  }

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalVisible(false)
    setEditingGraduate(null)
    form.resetFields()
  }

  // 保存毕业生
  const handleSave = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      
      const url = editingGraduate 
        ? `/api/team/graduates/${editingGraduate.id}`
        : '/api/team/graduates'
      
      const method = editingGraduate ? 'PUT' : 'POST'
      
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
      
      message.success(`${editingGraduate ? '更新' : '添加'}毕业生成功`)
      handleCloseModal()
      onDataRefresh()
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除毕业生
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/team/graduates/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('删除失败')
      }
      
      message.success('删除毕业生成功')
      onDataRefresh()
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }

  // 处理Excel文件上传和预览
  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        
        setWorkbook(wb)
        setSheetNames(wb.SheetNames)
        setSelectedSheet(wb.SheetNames[0]) // 默认选择第一个工作表
        
        // 预览第一个工作表的数据
        const worksheet = wb.Sheets[wb.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // 假设第一行是标题行
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]
        
        // 转换为对象数组
        const formattedData = rows.map((row, index) => {
          const obj: any = { key: index }
          headers.forEach((header, colIndex) => {
            obj[header] = row[colIndex] || ''
          })
          return obj
        })
        
        setPreviewData(formattedData)
        setImportModalVisible(true)
      } catch (error) {
        console.error('解析Excel文件失败:', error)
        message.error('解析Excel文件失败')
      }
    }
    reader.readAsArrayBuffer(file)
    return false // 阻止自动上传
  }

  // 处理工作表切换
  const handleSheetChange = (sheetName: string) => {
    if (!workbook) return
    
    setSelectedSheet(sheetName)
    
    try {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // 假设第一行是标题行
      const headers = jsonData[0] as string[]
      const rows = jsonData.slice(1) as any[][]
      
      // 转换为对象数组
      const formattedData = rows.map((row, index) => {
        const obj: any = { key: index }
        headers.forEach((header, colIndex) => {
          obj[header] = row[colIndex] || ''
        })
        return obj
      })
      
      setPreviewData(formattedData)
    } catch (error) {
      console.error('切换工作表失败:', error)
      message.error('切换工作表失败')
    }
  }

  // 确认导入数据
  const handleConfirmImport = async () => {
    try {
      setSubmitting(true)
      
      // 创建Excel工作簿
      const ws = XLSX.utils.json_to_sheet(previewData.map(item => ({
        '序号': item['序号'] || '',
        '姓名': item['姓名'] || item['name'] || '',
        '入学时间': item['入学时间'] || item['enrollmentDate'] || '',
        '毕业时间': item['毕业时间'] || item['graduationDate'] || '',
        '指导老师': item['指导老师'] || item['advisor'] || '',
        '学位': item['学位'] || item['degree'] || '',
        '学科': item['学科'] || item['discipline'] || '',
        '论文题目': item['论文题目'] || item['thesisTitle'] || '',
        '是否有论文': item['是否有论文'] || (item['hasPaper'] ? '是' : '否') || '否',
        '备注': item['备注'] || item['remarks'] || '',
        '职位': item['职位'] || item['position'] || '',
        '公司': item['公司'] || item['company'] || ''
      })))
      
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, selectedSheet || 'Sheet1')
      
      // 转换为Blob
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // 创建FormData
      const formData = new FormData()
      formData.append('file', blob, 'import.xlsx')
      if (selectedSheet) {
        formData.append('sheetName', selectedSheet)
      }
      
      const response = await fetch('/api/team/graduates/import', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '导入失败')
      }
      
      const result = await response.json()
      message.success(result.message || '导入毕业生数据成功')
      setImportModalVisible(false)
      setPreviewData([])
      setFileList([])
      onDataRefresh()
    } catch (error) {
      console.error('导入失败:', error)
      message.error(error instanceof Error ? error.message : '导入失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 导出Excel模板
  const handleExportTemplate = () => {
    const templateData = [
      ['姓名', '职位', '邮箱', '单位', '毕业年份', '学位', '学科', '导师', '论文题目', '入学时间', '毕业时间', '是否有论文'],
      ['张三', '软件工程师', 'zhangsan@example.com', '某科技公司', '2023', '硕士', '计算机科学', '李教授', '基于深度学习的图像识别研究', '2021-09', '2023-06', '是']
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '毕业生模板')
    XLSX.writeFile(wb, '毕业生导入模板.xlsx')
  }

  // 表格列定义
  const columns: ColumnsType<Graduate> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 100
    },
    {
      title: '学科',
      dataIndex: 'discipline',
      key: 'discipline',
      width: 120
    },
    {
      title: '学位',
      dataIndex: 'degree',
      key: 'degree',
      width: 80
    },
    {
      title: '导师',
      dataIndex: 'advisor',
      key: 'advisor',
      width: 100
    },
    {
      title: '入学时间',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      width: 100
    },
    {
      title: '毕业时间',
      dataIndex: 'graduationDate',
      key: 'graduationDate',
      width: 100
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      width: 120
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150,
      ellipsis: true
    },
    {
      title: '单位',
      dataIndex: 'company',
      key: 'company',
      width: 120,
      ellipsis: true
    },
    {
      title: '毕业年份',
      dataIndex: 'graduationYear',
      key: 'graduationYear',
      sorter: (a, b) => (a.graduationYear || 0) - (b.graduationYear || 0),
      width: 100
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
            title="确定要删除这个毕业生吗？"
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

  // 预览数据的列定义
  const previewColumns = previewData.length > 0 ? 
    Object.keys(previewData[0]).filter(key => key !== 'key').map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      ellipsis: true
    })) : []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">毕业生管理</h2>
        <Space>
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleExportTemplate}
          >
            下载模板
          </Button>
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={handleFileUpload}
            accept=".xlsx,.xls"
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              导入Excel
            </Button>
          </Upload>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            添加毕业生
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={graduates}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1600 }}
      />

      {/* 添加/编辑模态框 */}
      <Modal
        title={editingGraduate ? '编辑毕业生' : '添加毕业生'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        confirmLoading={submitting}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            
            <Form.Item
              name="position"
              label="职位"
            >
              <Input placeholder="请输入职位" />
            </Form.Item>
            
            <Form.Item
              name="company"
              label="单位"
            >
              <Input placeholder="请输入单位" />
            </Form.Item>
            
            <Form.Item
              name="graduationYear"
              label="毕业年份"
            >
              <InputNumber 
                placeholder="请输入毕业年份" 
                min={1900} 
                max={new Date().getFullYear() + 10}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              name="degree"
              label="学位"
            >
              <Select placeholder="请选择学位">
                <Select.Option value="学士">学士</Select.Option>
                <Select.Option value="硕士">硕士</Select.Option>
                <Select.Option value="博士">博士</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="discipline"
              label="学科"
            >
              <Input placeholder="请输入学科" />
            </Form.Item>
            
            <Form.Item
              name="advisor"
              label="导师"
            >
              <Input placeholder="请输入导师" />
            </Form.Item>
            
            <Form.Item
              name="enrollmentDate"
              label="入学时间"
            >
              <Input placeholder="请输入入学时间" />
            </Form.Item>
            
            <Form.Item
              name="graduationDate"
              label="毕业时间"
            >
              <Input placeholder="请输入毕业时间" />
            </Form.Item>
            
            <Form.Item
              name="hasPaper"
              label="是否有论文"
            >
              <Select placeholder="请选择">
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="thesisTitle"
            label="论文题目"
          >
            <Input.TextArea rows={2} placeholder="请输入论文题目" />
          </Form.Item>
          
          <Form.Item
            name="remarks"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Excel导入预览模态框 */}
      <Modal
        title="Excel导入预览"
        open={importModalVisible}
        onOk={handleConfirmImport}
        onCancel={() => {
          setImportModalVisible(false)
          setPreviewData([])
          setFileList([])
          setWorkbook(null)
          setSheetNames([])
          setSelectedSheet('')
        }}
        confirmLoading={submitting}
        width={1200}
        okText="确认导入"
        cancelText="取消"
      >
        <div className="mb-4 space-y-4">
          <p className="text-gray-600">预览将要导入的数据，确认无误后点击"确认导入"：</p>
          
          {sheetNames.length > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">选择工作表：</span>
              <Select
                value={selectedSheet}
                onChange={handleSheetChange}
                style={{ width: 200 }}
                placeholder="请选择工作表"
              >
                {sheetNames.map(name => (
                  <Select.Option key={name} value={name}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
              <span className="text-xs text-gray-500">
                共 {sheetNames.length} 个工作表
              </span>
            </div>
          )}
        </div>
        
        <Table
          columns={previewColumns}
          dataSource={previewData}
          rowKey="key"
          pagination={{
            pageSize: 5,
            showSizeChanger: false
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Modal>
    </div>
  )
}

export default GraduateManagement