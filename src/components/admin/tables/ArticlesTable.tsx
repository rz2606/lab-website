import React from 'react'
import Image from 'next/image'
import { Edit, Trash2, FileText, ExternalLink, Eye, Calendar, User, Clock } from 'lucide-react'
import type { Article, PaginationInfo } from '@/types/admin'
import { TableLoadingRow } from '../common/LoadingSpinner'
import { TableErrorRow } from '../common/ErrorBoundary'
import Pagination from '../common/Pagination'

interface ArticlesTableProps {
  articles: Article[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo
  onEdit: (article: Article) => void
  onDelete: (article: Article) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const ArticlesTable: React.FC<ArticlesTableProps> = ({
  articles = [],
  loading = false,
  error = null,
  pagination = { currentPage: 1, totalPages: 1, pageSize: 10, total: 0 },
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange
}) => {
  // 获取文章类型样式
  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'research':
        return 'bg-blue-100 text-blue-800'
      case 'tutorial':
        return 'bg-green-100 text-green-800'
      case 'review':
        return 'bg-purple-100 text-purple-800'
      case 'opinion':
        return 'bg-orange-100 text-orange-800'
      case 'case_study':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取文章类型显示文本
  const getTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'research':
        return '研究'
      case 'tutorial':
        return '教程'
      case 'review':
        return '综述'
      case 'opinion':
        return '观点'
      case 'case_study':
        return '案例研究'
      default:
        return type
    }
  }

  // 获取状态样式
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取状态显示文本
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return '已发布'
      case 'draft':
        return '草稿'
      case 'under_review':
        return '审核中'
      case 'archived':
        return '已归档'
      default:
        return status
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('zh-CN')
    } catch {
      return dateString
    }
  }

  // 格式化阅读时间
  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
  }

  // 截断文本
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // 渲染标签
  const renderTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.slice(0, 2).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            {tag}
          </span>
        ))}
        {tags.length > 2 && (
          <span className="text-xs text-gray-400">+{tags.length - 2}</span>
        )}
      </div>
    )
  }

  // 渲染作者列表
  const renderAuthors = (authors: string[]) => {
    if (!authors || authors.length === 0) return '未知'
    
    if (authors.length === 1) {
      return authors[0]
    }
    
    if (authors.length <= 3) {
      return authors.join(', ')
    }
    
    return `${authors.slice(0, 2).join(', ')} 等 ${authors.length} 人`
  }

  return (
    <div className="space-y-4">
      {/* 表格 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文章信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  统计
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发布日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <TableLoadingRow colSpan={7} />
              )}
              
              {error && (
                <TableErrorRow 
                  colSpan={7} 
                  message={error}
                />
              )}
              
              {!loading && !error && articles && articles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无文章数据</p>
                  </td>
                </tr>
              )}
              
              {!loading && !error && articles && articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  {/* 文章信息 */}
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <div className="flex items-center mb-1">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900" title={article.title}>
                          {truncateText(article.title, 40)}
                        </div>
                      </div>
                      {article.abstract && (
                        <div className="text-xs text-gray-500 mb-1" title={article.abstract}>
                          {truncateText(article.abstract, 100)}
                        </div>
                      )}
                      {article.keywords && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {article.keywords.split(',').slice(0, 2).map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                          {article.keywords.split(',').length > 2 && (
                            <span className="text-xs text-gray-400">+{article.keywords.split(',').length - 2}</span>
                          )}
                        </div>
                      )}

                    </div>
                  </td>
                  
                  {/* 类型 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      期刊论文
                    </span>
                  </td>
                  
                  {/* 作者 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900" title={article.authors}>
                        {article.authors}
                      </div>
                    </div>
                  </td>
                  
                  {/* 状态 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      已发布
                    </span>
                  </td>
                  
                  {/* 统计 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 space-y-1">
                      {article.citationCount !== undefined && (
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>引用: {article.citationCount}</span>
                        </div>
                      )}
                      {article.impactFactor && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>IF: {article.impactFactor}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* 发布日期 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(article.publishedDate)}
                    </div>
                  </td>
                  
                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {article.doi && (
                        <a
                          href={`https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="查看DOI链接"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(article)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="编辑文章"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(article)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="删除文章"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {!loading && !error && articles && articles.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalItems={pagination.total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          showQuickJumper={true}
          showSizeChanger={true}
        />
      )}
    </div>
  )
}

export default ArticlesTable