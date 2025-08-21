import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Upload, Download, Filter } from 'lucide-react'
import type { Publication } from '@/types/admin'
import PublicationsTable from '../tables/PublicationsTable'
import PublicationForm from '../forms/PublicationForm'
import AdminModal from '../modals/AdminModal'
import ConfirmModal from '../modals/ConfirmModal'
import SearchBar from '../common/SearchBar'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBoundary from '../common/ErrorBoundary'
import { usePagination } from '@/hooks/usePagination'
import { useAdminData } from '@/hooks/useAdminData'

interface PublicationsTabProps {
  className?: string
}

const PublicationsTab: React.FC<PublicationsTabProps> = ({ className = '' }) => {
  const {
    publications,
    loading,
    error,
    fetchPublications,
    createPublication,
    updatePublication,
    deletePublication,
    exportPublications,
    importPublications
  } = useAdminData()

  const {
    getPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination()

  const pagination = getPagination('publications')
  const { currentPage, pageSize } = pagination

  // 状态管理
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterYear, setFilterYear] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterQuartile, setFilterQuartile] = useState<string>('')
  
  // 排序状态 (暂时注释，未来可能需要)
  // const [sortField, setSortField] = useState<keyof Publication>('createdAt')
  // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedPublications, setSelectedPublications] = useState<string[]>([])
  
  // 模态框状态
  const [showPublicationModal, setShowPublicationModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null)
  const [deletingPublication, setDeletingPublication] = useState<Publication | null>(null)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  
  // 操作状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // 初始化数据
  useEffect(() => {
    fetchPublications()
  }, [fetchPublications])

  // 过滤和排序数据
  const filteredAndSortedPublications = React.useMemo(() => {
    // 确保 publications 存在且为数组
    if (!publications || !Array.isArray(publications)) {
      return []
    }

    const filtered = publications.filter(publication => {
      const matchesSearch = !searchTerm || 
        publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publication.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (publication.journal && publication.journal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (publication.conference && publication.conference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (publication.abstract && publication.abstract.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = !filterType || publication.type === filterType
      const matchesYear = !filterYear || publication.year.toString() === filterYear
      const matchesStatus = !filterStatus || publication.status === filterStatus
      const matchesQuartile = !filterQuartile || publication.quartile === filterQuartile
      
      return matchesSearch && matchesType && matchesYear && matchesStatus && matchesQuartile
    })

    return filtered
  }, [publications, searchTerm, filterType, filterYear, filterStatus, filterQuartile])

  // 计算分页数据
  const paginatedData = React.useMemo(() => {
    if (!filteredAndSortedPublications || !Array.isArray(filteredAndSortedPublications)) return []
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedPublications.slice(startIndex, endIndex)
  }, [filteredAndSortedPublications, currentPage, pageSize])

  // 重置分页当过滤条件改变时
  useEffect(() => {
    resetPagination('publications')
  }, [searchTerm, filterType, filterYear, filterStatus, filterQuartile, resetPagination])

  // 处理搜索
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // 处理排序
  // const handleSort = (field: keyof Publication) => {
  //   if (field === sortField) {
  //     setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  //   } else {
  //     setSortField(field)
  //     setSortDirection('asc')
  //   }
  // }

  // 处理出版物选择
  // const handlePublicationSelect = (publicationId: string, selected: boolean) => {
  //   setSelectedPublications(prev => 
  //     selected 
  //       ? [...prev, publicationId]
  //       : prev.filter(id => id !== publicationId)
  //   )
  // }

  // 处理全选
  // const handleSelectAll = (selected: boolean) => {
  //   setSelectedPublications(selected ? paginatedData.map(pub => pub.id) : [])
  // }

  // 打开新增发表成果模态框
  const handleAddPublication = () => {
    setEditingPublication(null)
    setShowPublicationModal(true)
  }

  // 打开编辑发表成果模态框
  const handleEditPublication = (publication: Publication) => {
    setEditingPublication(publication)
    setShowPublicationModal(true)
  }

  // 处理发表成果表单提交
  const handlePublicationSubmit = async (publicationData: Partial<Publication>) => {
    setIsSubmitting(true)
    try {
      if (editingPublication) {
        await updatePublication(publicationData, editingPublication.id)
      } else {
        await createPublication(publicationData)
      }
      setShowPublicationModal(false)
      setEditingPublication(null)
      await fetchPublications() // 刷新数据
    } catch (error) {
      console.error('保存发表成果失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 打开删除确认模态框
  const handleDeletePublication = (publication: Publication) => {
    setDeletingPublication(publication)
    setShowDeleteModal(true)
  }

  // 确认删除发表成果
  const confirmDeletePublication = async () => {
    if (!deletingPublication) return
    
    setIsDeleting(true)
    try {
      await deletePublication(deletingPublication.id)
      setShowDeleteModal(false)
      setDeletingPublication(null)
      await fetchPublications() // 刷新数据
    } catch (error) {
      console.error('删除发表成果失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedPublications.length === 0) return
    setShowBatchDeleteModal(true)
  }

  // 确认批量删除
  const confirmBatchDelete = async () => {
    setIsDeleting(true)
    try {
      await Promise.all(selectedPublications.map(publicationId => deletePublication(publicationId)))
      setShowBatchDeleteModal(false)
      setSelectedPublications([])
      await fetchPublications() // 刷新数据
    } catch (error) {
      console.error('批量删除发表成果失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 导出发表成果数据
  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportPublications(filteredAndSortedPublications)
    } catch (error) {
      console.error('导出发表成果数据失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导入发表成果数据
  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      await importPublications(file)
      await fetchPublications() // 刷新数据
    } catch (error) {
      console.error('导入发表成果数据失败:', error)
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
    setFilterYear('')
    setFilterStatus('')
    setFilterQuartile('')
    setSelectedPublications([])
  }

  // 获取年份列表
  const years = React.useMemo(() => {
    const yearSet = new Set(publications.map(pub => pub.year).filter(Boolean))
    return Array.from(yearSet).sort((a, b) => b - a)
  }, [publications])

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">加载发表成果数据失败</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => fetchPublications()}
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
              <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">发表成果管理</h2>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {filteredAndSortedPublications.length} 篇论文
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 批量操作 */}
              {selectedPublications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedPublications.length} 篇论文
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
                  id="import-publications"
                  disabled={isImporting}
                />
                <label
                  htmlFor="import-publications"
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
                  disabled={isExporting || filteredAndSortedPublications.length === 0}
                >
                  {isExporting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  导出
                </button>
              </div>
              
              {/* 添加发表成果按钮 */}
              <button
                onClick={handleAddPublication}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加论文
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
                placeholder="搜索论文标题、作者、期刊或摘要..."
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
                  <option value="journal">期刊论文</option>
                  <option value="conference">会议论文</option>
                  <option value="book">专著</option>
                  <option value="chapter">章节</option>
                  <option value="patent">专利</option>
                  <option value="preprint">预印本</option>
                </select>
                
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有年份</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select
                  value={filterQuartile}
                  onChange={(e) => setFilterQuartile(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有分区</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有状态</option>
                  <option value="published">已发表</option>
                  <option value="accepted">已接收</option>
                  <option value="submitted">已投稿</option>
                  <option value="draft">草稿</option>
                  <option value="rejected">被拒绝</option>
                </select>
              </div>
              
              {/* 清除过滤器 */}
              {(searchTerm || filterType || filterYear || filterStatus || filterQuartile) && (
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

        {/* 发表成果表格 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="加载发表成果数据中..." />
          </div>
        ) : (
          <PublicationsTable
            publications={paginatedData}
            loading={loading}
            error={error}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredAndSortedPublications.length,
              totalPages: Math.ceil(filteredAndSortedPublications.length / pageSize)
            }}
            onEdit={handleEditPublication}
            onDelete={handleDeletePublication}
            onPageChange={(page) => handlePageChange('publications', page)}
            onPageSizeChange={(pageSize) => handlePageSizeChange('publications', pageSize)}
          />
        )}

        {/* 发表成果表单模态框 */}
        <AdminModal
          isOpen={showPublicationModal}
          onClose={() => {
            setShowPublicationModal(false)
            setEditingPublication(null)
          }}
          title={editingPublication ? '编辑发表成果' : '添加发表成果'}
          size="xl"
        >
          <PublicationForm
            publication={editingPublication}
            onSubmit={handlePublicationSubmit}
            onCancel={() => {
              setShowPublicationModal(false)
              setEditingPublication(null)
            }}
            loading={isSubmitting}
          />
        </AdminModal>

        {/* 删除确认模态框 */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingPublication(null)
          }}
          onConfirm={confirmDeletePublication}
          title="删除发表成果"
          message={`确定要删除论文 "${deletingPublication?.title}" 吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />

        {/* 批量删除确认模态框 */}
        <ConfirmModal
          isOpen={showBatchDeleteModal}
          onClose={() => setShowBatchDeleteModal(false)}
          onConfirm={confirmBatchDelete}
          title="批量删除发表成果"
          message={`确定要删除选中的 ${selectedPublications.length} 篇论文吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />
      </div>
    </ErrorBoundary>
  )
}

export default PublicationsTab