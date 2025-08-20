import React, { useState, useEffect } from 'react'
import { Trophy, FileText, Plus, Upload, Download, Filter } from 'lucide-react'
import type { Article, Award } from '@/types/admin'
import ArticlesTable from '../tables/ArticlesTable'
import AwardsTable from '../tables/AwardsTable'
import ArticleForm from '../forms/ArticleForm'
import AwardForm from '../forms/AwardForm'
import AdminModal from '../modals/AdminModal'
import ConfirmModal from '../modals/ConfirmModal'
import SearchBar from '../common/SearchBar'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBoundary from '../common/ErrorBoundary'
import { usePagination } from '@/hooks/usePagination'
import { useAdminData } from '@/hooks/useAdminData'

interface AchievementsTabProps {
  className?: string
}

type TabType = 'articles' | 'awards'

const AchievementsTab: React.FC<AchievementsTabProps> = ({ className = '' }) => {
  const {
    articles,
    awards,
    loading,
    error,
    fetchArticles,
    fetchAwards,
    createArticle,
    updateArticle,
    deleteArticle,
    createAward,
    updateAward,
    deleteAward,
    exportArticles,
    importArticles,
    exportAwards,
    importAwards
  } = useAdminData()

  // 当前活跃标签
  const [activeTab, setActiveTab] = useState<TabType>('articles')

  // 文章分页
  const {
    getPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination()

  const articlesPagination = getPagination('articles')
  const { currentPage: articlesCurrentPage, pageSize: articlesPageSize } = articlesPagination

  // 获奖分页
  const awardsPagination = getPagination('awards')
  const { currentPage: awardsCurrentPage, pageSize: awardsPageSize } = awardsPagination

  // 文章状态管理
  const [articlesSearchTerm, setArticlesSearchTerm] = useState('')
  const [articlesFilterType, setArticlesFilterType] = useState<string>('')
  const [articlesFilterStatus, setArticlesFilterStatus] = useState<string>('')
  const [articlesFilterCategory, setArticlesFilterCategory] = useState<string>('')
  const [articlesSortField, setArticlesSortField] = useState<keyof Article>('publishDate')
  const [articlesSortDirection, setArticlesSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  // 获奖状态管理
  const [awardsSearchTerm, setAwardsSearchTerm] = useState('')
  const [awardsFilterType, setAwardsFilterType] = useState<string>('')
  const [awardsFilterLevel, setAwardsFilterLevel] = useState<string>('')
  const [awardsFilterRank, setAwardsFilterRank] = useState<string>('')
  const [awardsSortField, setAwardsSortField] = useState<keyof Award>('awardDate')
  const [awardsSortDirection, setAwardsSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedAwards, setSelectedAwards] = useState<string[]>([])
  
  // 模态框状态
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [showAwardModal, setShowAwardModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editingAward, setEditingAward] = useState<Award | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ type: 'article' | 'award', item: Article | Award } | null>(null)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  
  // 操作状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // 初始化数据
  useEffect(() => {
    fetchArticles()
    fetchAwards()
  }, [fetchArticles, fetchAwards])

  // 过滤和排序文章数据
  const filteredAndSortedArticles = React.useMemo(() => {
    // 确保 articles 存在且为数组
    if (!articles || !Array.isArray(articles)) {
      return []
    }

    const filtered = articles.filter(article => {
      const matchesSearch = !articlesSearchTerm || 
        article.title.toLowerCase().includes(articlesSearchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(articlesSearchTerm.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(articlesSearchTerm.toLowerCase())) ||
        article.tags.some(tag => tag.toLowerCase().includes(articlesSearchTerm.toLowerCase()))
      
      const matchesType = !articlesFilterType || article.type === articlesFilterType
      const matchesStatus = !articlesFilterStatus || article.status === articlesFilterStatus
      const matchesCategory = !articlesFilterCategory || article.category === articlesFilterCategory
      
      return matchesSearch && matchesType && matchesStatus && matchesCategory
    })

    // 排序
    filtered.sort((a, b) => {
      const aValue = a[articlesSortField]
      const bValue = b[articlesSortField]
      
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
      
      return articlesSortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [articles, articlesSearchTerm, articlesFilterType, articlesFilterStatus, articlesFilterCategory, articlesSortField, articlesSortDirection])

  // 过滤和排序获奖数据
  const filteredAndSortedAwards = React.useMemo(() => {
    // 确保 awards 存在且为数组
    if (!awards || !Array.isArray(awards)) {
      return []
    }

    const filtered = awards.filter(award => {
      const matchesSearch = !awardsSearchTerm || 
        award.name.toLowerCase().includes(awardsSearchTerm.toLowerCase()) ||
        award.description.toLowerCase().includes(awardsSearchTerm.toLowerCase()) ||
        award.organization.toLowerCase().includes(awardsSearchTerm.toLowerCase()) ||
        award.winners.some(winner => winner.toLowerCase().includes(awardsSearchTerm.toLowerCase())) ||
        award.tags.some(tag => tag.toLowerCase().includes(awardsSearchTerm.toLowerCase()))
      
      const matchesType = !awardsFilterType || award.type === awardsFilterType
      const matchesLevel = !awardsFilterLevel || award.level === awardsFilterLevel
      const matchesRank = !awardsFilterRank || award.rank === awardsFilterRank
      
      return matchesSearch && matchesType && matchesLevel && matchesRank
    })

    // 排序
    filtered.sort((a, b) => {
      const aValue = a[awardsSortField]
      const bValue = b[awardsSortField]
      
      if (aValue === undefined || aValue === null) return 1
      if (bValue === undefined || bValue === null) return -1
      
      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else if (Array.isArray(aValue) && Array.isArray(bValue)) {
        comparison = aValue.length - bValue.length
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }
      
      return awardsSortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [awards, awardsSearchTerm, awardsFilterType, awardsFilterLevel, awardsFilterRank, awardsSortField, awardsSortDirection])

  // 计算文章分页数据
  const paginatedArticles = React.useMemo(() => {
    if (!filteredAndSortedArticles || !Array.isArray(filteredAndSortedArticles)) return []
    const startIndex = (articlesCurrentPage - 1) * articlesPageSize
    const endIndex = startIndex + articlesPageSize
    return filteredAndSortedArticles.slice(startIndex, endIndex)
  }, [filteredAndSortedArticles, articlesCurrentPage, articlesPageSize])

  // 计算获奖分页数据
  const paginatedAwards = React.useMemo(() => {
    if (!filteredAndSortedAwards || !Array.isArray(filteredAndSortedAwards)) return []
    const startIndex = (awardsCurrentPage - 1) * awardsPageSize
    const endIndex = startIndex + awardsPageSize
    return filteredAndSortedAwards.slice(startIndex, endIndex)
  }, [filteredAndSortedAwards, awardsCurrentPage, awardsPageSize])

  // 重置分页当过滤条件改变时
  useEffect(() => {
    resetPagination('articles')
  }, [articlesSearchTerm, articlesFilterType, articlesFilterStatus, articlesFilterCategory, resetPagination])

  useEffect(() => {
    resetPagination('awards')
  }, [awardsSearchTerm, awardsFilterType, awardsFilterLevel, awardsFilterRank, resetPagination])

  // 处理标签切换
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    // 清除选择
    setSelectedArticles([])
    setSelectedAwards([])
  }

  // 文章相关处理函数
  const handleArticlesSearch = (term: string) => {
    setArticlesSearchTerm(term)
  }

  const handleArticlesSort = (field: keyof Article) => {
    if (field === articlesSortField) {
      setArticlesSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setArticlesSortField(field)
      setArticlesSortDirection('asc')
    }
  }

  const handleArticleSelect = (articleId: string, selected: boolean) => {
    setSelectedArticles(prev => 
      selected 
        ? [...prev, articleId]
        : prev.filter(id => id !== articleId)
    )
  }

  const handleArticlesSelectAll = (selected: boolean) => {
    setSelectedArticles(selected ? paginatedArticles.map(article => article.id) : [])
  }

  const handleAddArticle = () => {
    setEditingArticle(null)
    setShowArticleModal(true)
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setShowArticleModal(true)
  }

  const handleArticleSubmit = async (articleData: Partial<Article>) => {
    setIsSubmitting(true)
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, articleData)
      } else {
        await createArticle(articleData)
      }
      setShowArticleModal(false)
      setEditingArticle(null)
      await fetchArticles()
    } catch (error) {
      console.error('保存文章失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteArticle = (article: Article) => {
    setDeletingItem({ type: 'article', item: article })
    setShowDeleteModal(true)
  }

  // 获奖相关处理函数
  const handleAwardsSearch = (term: string) => {
    setAwardsSearchTerm(term)
  }

  const handleAwardsSort = (field: keyof Award) => {
    if (field === awardsSortField) {
      setAwardsSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setAwardsSortField(field)
      setAwardsSortDirection('asc')
    }
  }

  const handleAwardSelect = (awardId: string, selected: boolean) => {
    setSelectedAwards(prev => 
      selected 
        ? [...prev, awardId]
        : prev.filter(id => id !== awardId)
    )
  }

  const handleAwardsSelectAll = (selected: boolean) => {
    setSelectedAwards(selected ? paginatedAwards.map(award => award.id) : [])
  }

  const handleAddAward = () => {
    setEditingAward(null)
    setShowAwardModal(true)
  }

  const handleEditAward = (award: Award) => {
    setEditingAward(award)
    setShowAwardModal(true)
  }

  const handleAwardSubmit = async (awardData: Partial<Award>) => {
    setIsSubmitting(true)
    try {
      if (editingAward) {
        await updateAward(editingAward.id, awardData)
      } else {
        await createAward(awardData)
      }
      setShowAwardModal(false)
      setEditingAward(null)
      await fetchAwards()
    } catch (error) {
      console.error('保存获奖失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAward = (award: Award) => {
    setDeletingItem({ type: 'award', item: award })
    setShowDeleteModal(true)
  }

  // 通用删除处理
  const confirmDelete = async () => {
    if (!deletingItem) return
    
    setIsDeleting(true)
    try {
      if (deletingItem.type === 'article') {
        await deleteArticle(deletingItem.item.id)
        await fetchArticles()
      } else {
        await deleteAward(deletingItem.item.id)
        await fetchAwards()
      }
      setShowDeleteModal(false)
      setDeletingItem(null)
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    const selectedCount = activeTab === 'articles' ? selectedArticles.length : selectedAwards.length
    if (selectedCount === 0) return
    setShowBatchDeleteModal(true)
  }

  const confirmBatchDelete = async () => {
    setIsDeleting(true)
    try {
      if (activeTab === 'articles') {
        await Promise.all(selectedArticles.map(articleId => deleteArticle(articleId)))
        setSelectedArticles([])
        await fetchArticles()
      } else {
        await Promise.all(selectedAwards.map(awardId => deleteAward(awardId)))
        setSelectedAwards([])
        await fetchAwards()
      }
      setShowBatchDeleteModal(false)
    } catch (error) {
      console.error('批量删除失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 导出数据
  const handleExport = async () => {
    setIsExporting(true)
    try {
      if (activeTab === 'articles') {
        await exportArticles(filteredAndSortedArticles)
      } else {
        await exportAwards(filteredAndSortedAwards)
      }
    } catch (error) {
      console.error('导出数据失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导入数据
  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      if (activeTab === 'articles') {
        await importArticles(file)
        await fetchArticles()
      } else {
        await importAwards(file)
        await fetchAwards()
      }
    } catch (error) {
      console.error('导入数据失败:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImport(file)
    }
    event.target.value = ''
  }

  // 清除过滤器
  const clearFilters = () => {
    if (activeTab === 'articles') {
      setArticlesSearchTerm('')
      setArticlesFilterType('')
      setArticlesFilterStatus('')
      setArticlesFilterCategory('')
      setSelectedArticles([])
    } else {
      setAwardsSearchTerm('')
      setAwardsFilterType('')
      setAwardsFilterLevel('')
      setAwardsFilterRank('')
      setSelectedAwards([])
    }
  }

  // 获取分类列表
  const articleCategories = React.useMemo(() => {
    const categorySet = new Set(articles.map(article => article.category).filter(Boolean))
    return Array.from(categorySet).sort()
  }, [articles])

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">加载成果数据失败</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => {
              fetchArticles()
              fetchAwards()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  const currentData = activeTab === 'articles' ? filteredAndSortedArticles : filteredAndSortedAwards
  const selectedCount = activeTab === 'articles' ? selectedArticles.length : selectedAwards.length
  const searchTerm = activeTab === 'articles' ? articlesSearchTerm : awardsSearchTerm
  const hasFilters = activeTab === 'articles' 
    ? (articlesSearchTerm || articlesFilterType || articlesFilterStatus || articlesFilterCategory)
    : (awardsSearchTerm || awardsFilterType || awardsFilterLevel || awardsFilterRank)

  return (
    <ErrorBoundary>
      <div className={`p-6 ${className}`}>
        {/* 页面标题和标签栏 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">成果管理</h2>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {currentData.length} 个{activeTab === 'articles' ? '文章' : '获奖'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 批量操作 */}
              {selectedCount > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedCount} 个{activeTab === 'articles' ? '文章' : '获奖'}
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
                  id={`import-${activeTab}`}
                  disabled={isImporting}
                />
                <label
                  htmlFor={`import-${activeTab}`}
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
                  disabled={isExporting || currentData.length === 0}
                >
                  {isExporting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  导出
                </button>
              </div>
              
              {/* 添加按钮 */}
              <button
                onClick={activeTab === 'articles' ? handleAddArticle : handleAddAward}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加{activeTab === 'articles' ? '文章' : '获奖'}
              </button>
            </div>
          </div>
          
          {/* 标签栏 */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('articles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                文章 ({articles.length})
              </button>
              <button
                onClick={() => handleTabChange('awards')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'awards'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="h-4 w-4 inline mr-2" />
                获奖 ({awards.length})
              </button>
            </nav>
          </div>
          
          {/* 搜索和过滤栏 */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={activeTab === 'articles' ? handleArticlesSearch : handleAwardsSearch}
                placeholder={`搜索${activeTab === 'articles' ? '文章标题、摘要、作者或标签' : '获奖名称、描述、组织或获奖者'}...`}
                className="w-full"
              />
            </div>
            
            {/* 过滤器 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                
                {activeTab === 'articles' ? (
                  <>
                    <select
                      value={articlesFilterType}
                      onChange={(e) => setArticlesFilterType(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">所有类型</option>
                      <option value="research">研究论文</option>
                      <option value="review">综述</option>
                      <option value="tutorial">教程</option>
                      <option value="blog">博客</option>
                      <option value="news">新闻</option>
                      <option value="other">其他</option>
                    </select>
                    
                    <select
                      value={articlesFilterStatus}
                      onChange={(e) => setArticlesFilterStatus(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">所有状态</option>
                      <option value="draft">草稿</option>
                      <option value="published">已发布</option>
                      <option value="archived">已归档</option>
                    </select>
                    
                    <select
                      value={articlesFilterCategory}
                      onChange={(e) => setArticlesFilterCategory(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">所有分类</option>
                      {articleCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <select
                      value={awardsFilterType}
                      onChange={(e) => setAwardsFilterType(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">所有类型</option>
                      <option value="academic">学术奖项</option>
                      <option value="competition">竞赛奖项</option>
                      <option value="honor">荣誉称号</option>
                      <option value="grant">资助项目</option>
                      <option value="patent">专利</option>
                      <option value="other">其他</option>
                    </select>
                    
                    <select
                      value={awardsFilterLevel}
                      onChange={(e) => setAwardsFilterLevel(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">所有级别</option>
                      <option value="international">国际级</option>
                      <option value="national">国家级</option>
                      <option value="provincial">省级</option>
                      <option value="municipal">市级</option>
                      <option value="institutional">校级</option>
                      <option value="other">其他</option>
                    </select>
                    
                    <select
                      value={awardsFilterRank}
                      onChange={(e) => setAwardsFilterRank(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">所有等级</option>
                      <option value="first">一等奖</option>
                      <option value="second">二等奖</option>
                      <option value="third">三等奖</option>
                      <option value="excellence">优秀奖</option>
                      <option value="participation">参与奖</option>
                      <option value="other">其他</option>
                    </select>
                  </>
                )}
              </div>
              
              {/* 清除过滤器 */}
              {hasFilters && (
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

        {/* 内容区域 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text={`加载${activeTab === 'articles' ? '文章' : '获奖'}数据中...`} />
          </div>
        ) : (
          <div>
            {activeTab === 'articles' ? (
              <ArticlesTable
                articles={paginatedArticles}
                loading={loading}
                selectedArticles={selectedArticles}
                sortField={articlesSortField}
                sortDirection={articlesSortDirection}
                onSort={handleArticlesSort}
                onEdit={handleEditArticle}
                onDelete={handleDeleteArticle}
                onSelect={handleArticleSelect}
                onSelectAll={handleArticlesSelectAll}
                currentPage={articlesCurrentPage}
                pageSize={articlesPageSize}
                totalItems={filteredAndSortedArticles.length}
                totalPages={Math.ceil(filteredAndSortedArticles.length / articlesPageSize)}
                onPageChange={(page) => handlePageChange('articles', page)}
                onPageSizeChange={(size) => handlePageSizeChange('articles', size)}
              />
            ) : (
              <AwardsTable
                awards={paginatedAwards}
                loading={loading}
                selectedAwards={selectedAwards}
                sortField={awardsSortField}
                sortDirection={awardsSortDirection}
                onSort={handleAwardsSort}
                onEdit={handleEditAward}
                onDelete={handleDeleteAward}
                onSelect={handleAwardSelect}
                onSelectAll={handleAwardsSelectAll}
                currentPage={awardsCurrentPage}
                pageSize={awardsPageSize}
                totalItems={filteredAndSortedAwards.length}
                totalPages={Math.ceil(filteredAndSortedAwards.length / awardsPageSize)}
                onPageChange={(page) => handlePageChange('awards', page)}
                onPageSizeChange={(size) => handlePageSizeChange('awards', size)}
              />
            )}
          </div>
        )}

        {/* 文章表单模态框 */}
        <AdminModal
          isOpen={showArticleModal}
          onClose={() => {
            setShowArticleModal(false)
            setEditingArticle(null)
          }}
          title={editingArticle ? '编辑文章' : '添加文章'}
          size="xl"
        >
          <ArticleForm
            article={editingArticle}
            onSubmit={handleArticleSubmit}
            onCancel={() => {
              setShowArticleModal(false)
              setEditingArticle(null)
            }}
            loading={isSubmitting}
          />
        </AdminModal>

        {/* 获奖表单模态框 */}
        <AdminModal
          isOpen={showAwardModal}
          onClose={() => {
            setShowAwardModal(false)
            setEditingAward(null)
          }}
          title={editingAward ? '编辑获奖' : '添加获奖'}
          size="xl"
        >
          <AwardForm
            award={editingAward}
            onSubmit={handleAwardSubmit}
            onCancel={() => {
              setShowAwardModal(false)
              setEditingAward(null)
            }}
            loading={isSubmitting}
          />
        </AdminModal>

        {/* 删除确认模态框 */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingItem(null)
          }}
          onConfirm={confirmDelete}
          title={`删除${deletingItem?.type === 'article' ? '文章' : '获奖'}`}
          message={`确定要删除${deletingItem?.type === 'article' ? '文章' : '获奖'} "${deletingItem?.item.title || deletingItem?.item.name}" 吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />

        {/* 批量删除确认模态框 */}
        <ConfirmModal
          isOpen={showBatchDeleteModal}
          onClose={() => setShowBatchDeleteModal(false)}
          onConfirm={confirmBatchDelete}
          title={`批量删除${activeTab === 'articles' ? '文章' : '获奖'}`}
          message={`确定要删除选中的 ${selectedCount} 个${activeTab === 'articles' ? '文章' : '获奖'}吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />
      </div>
    </ErrorBoundary>
  )
}

export default AchievementsTab