'use client'

import React, { useState } from 'react'
import { Table, Button, Form, Input, Select, message, Modal, Space, Popconfirm, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import * as XLSX from 'xlsx'
import type { Award } from '@/types/admin'

interface AwardManagementProps {
  awards: Award[]
  onDataRefresh: () => void
  loading: boolean
}

const AwardManagement: React.FC<AwardManagementProps> = ({ 
  awards, 
  onDataRefresh, 
  loading 
}) => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingAward, setEditingAward] = useState<Award | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')

  // 打开模态框
  const handleOpenModal = (award?: Award) => {
    if (award) {
      setEditingAward(award)
      form.setFieldsValue({
        serialNumber: award.serialNumber,
        awardee: award.awardee,
        awardDate: award.awardDate,
        awardName: award.awardName,
        advisor: award.advisor,
        remarks: award.remarks
      })
    } else {
      setEditingAward(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalVisible(false)
    setEditingAward(null)
    form.resetFields()
  }

  // 保存获奖记录
  const handleSave = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      
      const url = editingAward 
        ? `/api/awards/${editingAward.id}`
        : '/api/awards'
      
      const method = editingAward ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }
      
      message.success(editingAward ? '更新获奖记录成功' : '添加获奖记录成功')
      handleCloseModal()
      onDataRefresh()
    } catch (error) {
      console.error('保存获奖记录失败:', error)
      message.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除获奖记录
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/awards/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除失败')
      }
      
      message.success('删除获奖记录成功')
      onDataRefresh()
    } catch (error) {
      console.error('删除获奖记录失败:', error)
      message.error(error instanceof Error ? error.message : '删除失败')
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
        '获奖人员': item['获奖人员'] || item['awardee'] || '',
        '获奖时间': item['获奖时间'] || item['awardDate'] || '',
        '获奖名称及等级': item['获奖名称及等级'] || item['awardName'] || '',
        '指导老师': item['指导老师'] || item['advisor'] || '',
        '备注': item['备注'] || item['remarks'] || ''
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
      
      const response = await fetch('/api/awards/import', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '导入失败')
      }
      
      const result = await response.json()
      message.success(result.message || '导入获奖数据成功')
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
      ['序号', '获奖人员', '获奖时间', '获奖名称及等级', '指导老师', '备注'],
      ['1', '张三', '2023年', '国家奖学金', '李教授', '优秀学生']
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '获奖模板')
    XLSX.writeFile(wb, '获奖导入模板.xlsx')
  }

  // 表格列定义
  const columns: ColumnsType<Award> = [
    {
      title: '序号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 80
    },
    {
      title: '获奖人员',
      dataIndex: 'awardee',
      key: 'awardee',
      width: 150,
      ellipsis: true
    },
    {
      title: '获奖时间',
      dataIndex: 'awardDate',
      key: 'awardDate',
      width: 120
    },
    {
      title: '获奖名称及等级',
      dataIndex: 'awardName',
      key: 'awardName',
      width: 200,
      ellipsis: true
    },
    {
      title: '指导老师',
      dataIndex: 'advisor',
      key: 'advisor',
      width: 120
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
      ellipsis: true
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
            title="确定要删除这个获奖记录吗？"
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
        <h2 className="text-xl font-semibold">获奖管理</h2>
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
            添加获奖
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={awards}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1200 }}
      />

      {/* 添加/编辑模态框 */}
      <Modal
        title={editingAward ? '编辑获奖记录' : '添加获奖记录'}
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
            name="serialNumber"
            label="序号"
          >
            <Input placeholder="请输入序号" />
          </Form.Item>
          
          <Form.Item
            name="awardee"
            label="获奖人员"
            rules={[{ required: true, message: '请输入获奖人员' }]}
          >
            <Input placeholder="请输入获奖人员" />
          </Form.Item>
          
          <Form.Item
            name="awardDate"
            label="获奖时间"
          >
            <Input placeholder="请输入获奖时间" />
          </Form.Item>
          
          <Form.Item
            name="awardName"
            label="获奖名称及等级"
            rules={[{ required: true, message: '请输入获奖名称及等级' }]}
          >
            <Input placeholder="请输入获奖名称及等级" />
          </Form.Item>
          
          <Form.Item
            name="advisor"
            label="指导老师"
          >
            <Input placeholder="请输入指导老师" />
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

export default AwardManagement