import React, { useState, useEffect } from 'react'
import { Wrench, Plus, Upload, Download, Filter } from 'lucide-react'
import type { Tool } from '@/types/admin'
import ToolsTable from '../tables/ToolsTable'
import ToolForm from '../forms/ToolForm'
import AdminModal from '../modals/AdminModal'
import ConfirmModal from '../modals/ConfirmModal'
import SearchBar from '../common/SearchBar'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBoundary from '../common/ErrorBoundary'
import { usePagination } from '@/hooks/usePagination'
import { useAdminData } from '@/hooks/useAdminData'

interface ToolsTabProps {
  className?: string
}

const ToolsTab: React.FC<ToolsTabProps> = ({ className = '' }) => {
  const {
    tools,
    loading,
    error,
    fetchTools,
    createTool,
    updateTool,
    deleteTool,
    exportTools,
    importTools
  } = useAdminData()

  const {
    getPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination()

  const pagination = getPagination('tools')
  const { currentPage, pageSize } = pagination

  // 状态管理
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterLicense, setFilterLicense] = useState<string>('')
  
  // 排序状态 (暂时注释，未来可能需要)
  // const [sortField, setSortField] = useState<keyof Tool>('createdAt')
  // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  
  // 模态框状态
  const [showToolModal, setShowToolModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  
  // 操作状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // 初始化数据
  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  // 过滤和排序数据
  const filteredAndSortedTools = React.useMemo(() => {
    // 确保 tools 存在且为数组
    if (!tools || !Array.isArray(tools)) {
      return []
    }

    const filtered = tools.filter(tool => {
      const matchesSearch = !searchTerm || 
        tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = !filterType || tool.type === filterType
      const matchesCategory = !filterCategory || tool.category === filterCategory
      const matchesStatus = !filterStatus || tool.status === filterStatus
      const matchesLicense = !filterLicense || tool.license === filterLicense
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesLicense
    })

    return filtered
  }, [tools, searchTerm, filterType, filterCategory, filterStatus, filterLicense])

  // 计算分页数据
  const paginatedData = React.useMemo(() => {
    if (!filteredAndSortedTools || !Array.isArray(filteredAndSortedTools)) return []
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedTools.slice(startIndex, endIndex)
  }, [filteredAndSortedTools, currentPage, pageSize])

  // 重置分页当过滤条件改变时
  useEffect(() => {
    resetPagination('tools')
  }, [searchTerm, filterType, filterCategory, filterStatus, filterLicense, resetPagination])

  // 处理搜索
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // 处理排序
  // const handleSort = (field: keyof Tool) => {
  //   if (field === sortField) {
  //     setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  //   } else {
  //     setSortField(field)
  //     setSortDirection('asc')
  //   }
  // }

  // 处理工具选择
  // const handleToolSelect = (toolId: string, selected: boolean) => {
  //   setSelectedTools(prev => 
  //     selected 
  //       ? [...prev, toolId]
  //       : prev.filter(id => id !== toolId)
  //   )
  // }

  // 处理全选
  // const handleSelectAll = (selected: boolean) => {
  //   setSelectedTools(selected ? paginatedData.map(tool => tool.id) : [])
  // }

  // 打开新增工具模态框
  const handleAddTool = () => {
    setEditingTool(null)
    setShowToolModal(true)
  }

  // 打开编辑工具模态框
  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool)
    setShowToolModal(true)
  }

  // 处理工具表单提交
  const handleToolSubmit = async (toolData: Partial<Tool>) => {
    setIsSubmitting(true)
    try {
      if (editingTool) {
        await updateTool(toolData, editingTool.id)
      } else {
        await createTool(toolData)
      }
      setShowToolModal(false)
      setEditingTool(null)
      await fetchTools() // 刷新数据
    } catch (error) {
      console.error('保存工具失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 打开删除确认模态框
  const handleDeleteTool = (tool: Tool) => {
    setDeletingTool(tool)
    setShowDeleteModal(true)
  }

  // 确认删除工具
  const confirmDeleteTool = async () => {
    if (!deletingTool) return
    
    setIsDeleting(true)
    try {
      await deleteTool(deletingTool.id)
      setShowDeleteModal(false)
      setDeletingTool(null)
      await fetchTools() // 刷新数据
    } catch (error) {
      console.error('删除工具失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedTools.length === 0) return
    setShowBatchDeleteModal(true)
  }

  // 确认批量删除
  const confirmBatchDelete = async () => {
    setIsDeleting(true)
    try {
      await Promise.all(selectedTools.map(toolId => deleteTool(toolId)))
      setShowBatchDeleteModal(false)
      setSelectedTools([])
      await fetchTools() // 刷新数据
    } catch (error) {
      console.error('批量删除工具失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 导出工具数据
  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportTools(filteredAndSortedTools)
    } catch (error) {
      console.error('导出工具数据失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导入工具数据
  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      await importTools(file)
      await fetchTools() // 刷新数据
    } catch (error) {
      console.error('导入工具数据失败:', error)
    } finally {
      setIsImporting(false)
    }
  }

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImport(file)
    }
    // 重置文件输入
    event.target.value = ''
  }

  // 清除过滤器
  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('')
    setFilterCategory('')
    setFilterStatus('')
    setFilterLicense('')
    setSelectedTools([])
  }

  // 获取分类列表
  const categories = React.useMemo(() => {
    const categorySet = new Set(tools.map(tool => tool.category).filter(Boolean))
    return Array.from(categorySet).sort()
  }, [tools])

  // 获取许可证列表
  const licenses = React.useMemo(() => {
    const licenseSet = new Set(tools.map(tool => tool.license).filter(Boolean))
    return Array.from(licenseSet).sort()
  }, [tools])

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">加载工具数据失败</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => fetchTools()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`p-6 ${className}`}>
        {/* 页面标题和操作栏 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wrench className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">工具管理</h2>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {filteredAndSortedTools.length} 个工具
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 批量操作 */}
              {selectedTools.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedTools.length} 个工具
                  </span>
                  <button
                    onClick={handleBatchDelete}
                    className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                    disabled={isDeleting}
                  >
                    批量删除
                  </button>
                </div>
              )}
              
              {/* 导入导出 */}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="import-tools"
                  disabled={isImporting}
                />
                <label
                  htmlFor="import-tools"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  导入
                </label>
                
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  disabled={isExporting || filteredAndSortedTools.length === 0}
                >
                  {isExporting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  导出
                </button>
              </div>
              
              {/* 添加工具按钮 */}
              <button
                onClick={handleAddTool}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加工具
              </button>
            </div>
          </div>
          
          {/* 搜索和过滤栏 */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={handleSearch}
                placeholder="搜索工具名称、描述、作者或标签..."
                className="w-full"
              />
            </div>
            
            {/* 过滤器 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有类型</option>
                  <option value="software">软件</option>
                  <option value="library">库</option>
                  <option value="framework">框架</option>
                  <option value="tool">工具</option>
                  <option value="dataset">数据集</option>
                  <option value="model">模型</option>
                  <option value="api">API</option>
                  <option value="plugin">插件</option>
                </select>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有分类</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={filterLicense}
                  onChange={(e) => setFilterLicense(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有许可证</option>
                  {licenses.map(license => (
                    <option key={license} value={license}>{license}</option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有状态</option>
                  <option value="active">活跃</option>
                  <option value="maintenance">维护中</option>
                  <option value="deprecated">已弃用</option>
                  <option value="beta">测试版</option>
                  <option value="alpha">内测版</option>
                </select>
              </div>
              
              {/* 清除过滤器 */}
              {(searchTerm || filterType || filterCategory || filterStatus || filterLicense) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  清除
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 工具表格 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="加载工具数据中..." />
          </div>
        ) : (
          <ToolsTable
            tools={paginatedData}
            loading={loading}
            error={error}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredAndSortedTools.length,
              totalPages: Math.ceil(filteredAndSortedTools.length / pageSize)
            }}
            onEdit={handleEditTool}
            onDelete={handleDeleteTool}
            onPageChange={(page) => handlePageChange('tools', page)}
            onPageSizeChange={(size) => handlePageSizeChange('tools', size)}
          />
        )}

        {/* 工具表单模态框 */}
        <AdminModal
          isOpen={showToolModal}
          onClose={() => {
            setShowToolModal(false)
            setEditingTool(null)
          }}
          title={editingTool ? '编辑工具' : '添加工具'}
          size="xl"
        >
          <ToolForm
            tool={editingTool}
            onSubmit={handleToolSubmit}
            onCancel={() => {
              setShowToolModal(false)
              setEditingTool(null)
            }}
            loading={isSubmitting}
          />
        </AdminModal>

        {/* 删除确认模态框 */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingTool(null)
          }}
          onConfirm={confirmDeleteTool}
          title="删除工具"
          message={`确定要删除工具 "${deletingTool?.name}" 吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />

        {/* 批量删除确认模态框 */}
        <ConfirmModal
          isOpen={showBatchDeleteModal}
          onClose={() => setShowBatchDeleteModal(false)}
          onConfirm={confirmBatchDelete}
          title="批量删除工具"
          message={`确定要删除选中的 ${selectedTools.length} 个工具吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />
      </div>
    </ErrorBoundary>
  )
}

export default ToolsTab