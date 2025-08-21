import React, { useState, useEffect } from 'react'
import { Newspaper, Plus, Upload, Download, Filter } from 'lucide-react'
import type { News } from '@/types/admin'
import NewsTable from '../tables/NewsTable'
import NewsForm from '../forms/NewsForm'
import AdminModal from '../modals/AdminModal'
import ConfirmModal from '../modals/ConfirmModal'
import SearchBar from '../common/SearchBar'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBoundary from '../common/ErrorBoundary'
import { usePagination } from '@/hooks/usePagination'
import { useAdminData } from '@/hooks/useAdminData'

interface NewsTabProps {
  className?: string
}

const NewsTab: React.FC<NewsTabProps> = ({ className = '' }) => {
  const {
    news,
    loading,
    error,
    fetchNews,
    createNews,
    updateNews,
    deleteNews,
    exportNews,
    importNews
  } = useAdminData()

  const {
    getPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination()

  const pagination = getPagination('news')
  const { currentPage, pageSize } = pagination

  // 状态管理
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterVisibility, setFilterVisibility] = useState<string>('')
  const [filterAuthor, setFilterAuthor] = useState<string>('')
  const [sortField, setSortField] = useState<keyof News>('publishDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedNews, setSelectedNews] = useState<string[]>([])
  
  // 模态框状态
  const [showNewsModal, setShowNewsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [deletingNews, setDeletingNews] = useState<News | null>(null)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  
  // 操作状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // 初始化数据
  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // 过滤和排序数据
  const filteredAndSortedNews = React.useMemo(() => {
    // 确保 news 存在且为数组
    if (!news || !Array.isArray(news)) {
      return []
    }

    const filtered = news.filter(newsItem => {
      console.log('newsItem',newsItem)
      const matchesSearch = !searchTerm || 
        (newsItem?.title && newsItem.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (newsItem?.summary && newsItem.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (newsItem?.author && newsItem.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (newsItem?.source && newsItem.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (newsItem?.tags && Array.isArray(newsItem.tags) && newsItem.tags.some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesType = !filterType || newsItem.type === filterType
      const matchesStatus = !filterStatus || newsItem.status === filterStatus
      const matchesVisibility = !filterVisibility || newsItem.visibility === filterVisibility
      const matchesAuthor = !filterAuthor || newsItem.author === filterAuthor
      
      return matchesSearch && matchesType && matchesStatus && matchesVisibility && matchesAuthor
    })

    // 排序
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === undefined || aValue === null) return 1
      if (bValue === undefined || bValue === null) return -1
      
      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else if (Array.isArray(aValue) && Array.isArray(bValue)) {
        comparison = aValue.length - bValue.length
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [news, searchTerm, filterType, filterStatus, filterVisibility, filterAuthor, sortField, sortDirection])

  // 计算分页数据
  const paginatedData = React.useMemo(() => {
    if (!filteredAndSortedNews || !Array.isArray(filteredAndSortedNews)) return []
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedNews.slice(startIndex, endIndex)
  }, [filteredAndSortedNews, currentPage, pageSize])

  // 重置分页当过滤条件改变时
  useEffect(() => {
    resetPagination('news')
  }, [searchTerm, filterType, filterStatus, filterVisibility, filterAuthor, resetPagination])

  // 处理搜索
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // 处理排序
  const handleSort = (field: keyof News) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // 处理新闻选择
  const handleNewsSelect = (newsId: string, selected: boolean) => {
    setSelectedNews(prev => 
      selected 
        ? [...prev, newsId]
        : prev.filter(id => id !== newsId)
    )
  }

  // 处理全选
  const handleSelectAll = (selected: boolean) => {
    setSelectedNews(selected ? paginatedData.map(newsItem => newsItem.id) : [])
  }

  // 打开新增新闻模态框
  const handleAddNews = () => {
    setEditingNews(null)
    setShowNewsModal(true)
  }

  // 打开编辑新闻模态框
  const handleEditNews = (newsItem: News) => {
    setEditingNews(newsItem)
    setShowNewsModal(true)
  }

  // 处理新闻表单提交
  const handleNewsSubmit = async (newsData: Partial<News>) => {
    setIsSubmitting(true)
    try {
      if (editingNews) {
        await updateNews(newsData, editingNews.id)
      } else {
        await createNews(newsData)
      }
      setShowNewsModal(false)
      setEditingNews(null)
      await fetchNews() // 刷新数据
    } catch (error) {
      console.error('保存新闻失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 打开删除确认模态框
  const handleDeleteNews = (newsItem: News) => {
    setDeletingNews(newsItem)
    setShowDeleteModal(true)
  }

  // 确认删除新闻
  const confirmDeleteNews = async () => {
    if (!deletingNews) return
    
    setIsDeleting(true)
    try {
      await deleteNews(deletingNews.id)
      setShowDeleteModal(false)
      setDeletingNews(null)
      await fetchNews() // 刷新数据
    } catch (error) {
      console.error('删除新闻失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedNews.length === 0) return
    setShowBatchDeleteModal(true)
  }

  // 确认批量删除
  const confirmBatchDelete = async () => {
    setIsDeleting(true)
    try {
      await Promise.all(selectedNews.map(newsId => deleteNews(newsId)))
      setShowBatchDeleteModal(false)
      setSelectedNews([])
      await fetchNews() // 刷新数据
    } catch (error) {
      console.error('批量删除新闻失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 导出新闻数据
  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportNews(filteredAndSortedNews)
    } catch (error) {
      console.error('导出新闻数据失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导入新闻数据
  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      await importNews(file)
      await fetchNews() // 刷新数据
    } catch (error) {
      console.error('导入新闻数据失败:', error)
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
    setFilterStatus('')
    setFilterVisibility('')
    setFilterAuthor('')
    setSelectedNews([])
  }

  // 获取作者列表
  const authors = React.useMemo(() => {
    const authorSet = new Set(news.map(newsItem => newsItem.author).filter(Boolean))
    return Array.from(authorSet).sort()
  }, [news])

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">加载新闻数据失败</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => fetchNews()}
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
              <Newspaper className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">新闻管理</h2>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {filteredAndSortedNews.length} 条新闻
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 批量操作 */}
              {selectedNews.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedNews.length} 条新闻
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
                  id="import-news"
                  disabled={isImporting}
                />
                <label
                  htmlFor="import-news"
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
                  disabled={isExporting || filteredAndSortedNews.length === 0}
                >
                  {isExporting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  导出
                </button>
              </div>
              
              {/* 添加新闻按钮 */}
              <button
                onClick={handleAddNews}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加新闻
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
                placeholder="搜索新闻标题、摘要、作者或标签..."
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
                  <option value="announcement">公告</option>
                  <option value="research">研究动态</option>
                  <option value="event">活动</option>
                  <option value="achievement">成果</option>
                  <option value="collaboration">合作</option>
                  <option value="media">媒体报道</option>
                  <option value="other">其他</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有状态</option>
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="archived">已归档</option>
                  <option value="scheduled">定时发布</option>
                </select>
                
                <select
                  value={filterVisibility}
                  onChange={(e) => setFilterVisibility(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有可见性</option>
                  <option value="public">公开</option>
                  <option value="private">私有</option>
                  <option value="internal">内部</option>
                </select>
                
                <select
                  value={filterAuthor}
                  onChange={(e) => setFilterAuthor(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有作者</option>
                  {authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>
              
              {/* 清除过滤器 */}
              {(searchTerm || filterType || filterStatus || filterVisibility || filterAuthor) && (
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

        {/* 新闻表格 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="加载新闻数据中..." />
          </div>
        ) : (
          <NewsTable
            news={paginatedData}
            loading={loading}
            selectedNews={selectedNews}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onEdit={handleEditNews}
            onDelete={handleDeleteNews}
            onSelect={handleNewsSelect}
            onSelectAll={handleSelectAll}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredAndSortedNews.length}
            totalPages={Math.ceil(filteredAndSortedNews.length / pageSize)}
            onPageChange={(page) => handlePageChange('news', page)}
            onPageSizeChange={(size) => handlePageSizeChange('news', size)}
          />
        )}

        {/* 新闻表单模态框 */}
        <AdminModal
          isOpen={showNewsModal}
          onClose={() => {
            setShowNewsModal(false)
            setEditingNews(null)
          }}
          title={editingNews ? '编辑新闻' : '添加新闻'}
          size="xl"
        >
          <NewsForm
            news={editingNews}
            onSubmit={handleNewsSubmit}
            onCancel={() => {
              setShowNewsModal(false)
              setEditingNews(null)
            }}
            loading={isSubmitting}
          />
        </AdminModal>

        {/* 删除确认模态框 */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingNews(null)
          }}
          onConfirm={confirmDeleteNews}
          title="删除新闻"
          message={`确定要删除新闻 "${deletingNews?.title}" 吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />

        {/* 批量删除确认模态框 */}
        <ConfirmModal
          isOpen={showBatchDeleteModal}
          onClose={() => setShowBatchDeleteModal(false)}
          onConfirm={confirmBatchDelete}
          title="批量删除新闻"
          message={`确定要删除选中的 ${selectedNews.length} 条新闻吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />
      </div>
    </ErrorBoundary>
  )
}

export default NewsTab