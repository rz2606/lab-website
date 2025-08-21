import React from 'react'
import Image from 'next/image'
import { Edit, Trash2, Calendar, User, Newspaper, ExternalLink } from 'lucide-react'
import type { News, PaginationInfo } from '@/types/admin'
import { TableLoadingRow } from '../common/LoadingSpinner'
import { TableErrorRow } from '../common/ErrorBoundary'
import Pagination from '../common/Pagination'

interface NewsTableProps {
  news: News[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo
  onEdit: (news: News) => void
  onDelete: (news: News) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const NewsTable: React.FC<NewsTableProps> = ({
  news = [],
  loading = false,
  error = null,
  pagination = { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange
}) => {
  // 获取新闻类型样式
  const getTypeBadgeClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800'
      case 'research':
        return 'bg-green-100 text-green-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      case 'award':
        return 'bg-yellow-100 text-yellow-800'
      case 'publication':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取新闻类型显示文本
  const getTypeText = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'announcement':
        return '公告'
      case 'research':
        return '研究'
      case 'event':
        return '活动'
      case 'award':
        return '获奖'
      case 'publication':
        return '发表'
      default:
        return type
    }
  }

  // 获取状态样式
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取状态显示文本
  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return '已发布'
      case 'draft':
        return '草稿'
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

  // 截断文本
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // 渲染标签
  const renderTags = (tags: string) => {
    if (!tags || tags.trim() === '') return null
    
    // 将字符串按逗号分割成数组，并去除空白
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    
    if (tagArray.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tagArray.slice(0, 2).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            {tag}
          </span>
        ))}
        {tagArray.length > 2 && (
          <span className="text-xs text-gray-400">+{tagArray.length - 2}</span>
        )}
      </div>
    )
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
                  新闻信息
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
                  发布日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <TableLoadingRow colSpan={6} />
              )}
              
              {error && (
                <TableErrorRow 
                  colSpan={6} 
                  message={error}
                />
              )}
              
              {!loading && !error && (!news || news.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Newspaper className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无新闻数据</p>
                  </td>
                </tr>
              )}
              
              {!loading && !error && news && news.map((newsItem) => (
                <tr key={newsItem.id} className="hover:bg-gray-50">
                  {/* 新闻信息 */}
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <div className="flex items-center mb-1">
                        <Newspaper className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900" title={newsItem.title}>
                          {truncateText(newsItem.title, 40)}
                        </div>
                      </div>
                      {newsItem.summary && (
                        <div className="text-xs text-gray-500 mb-1" title={newsItem.summary}>
                          {truncateText(newsItem.summary, 100)}
                        </div>
                      )}
                      {renderTags(newsItem.tags)}
                      {newsItem.imageUrl && (
                        <div className="mt-2">
                          <Image
                            src={newsItem.imageUrl}
                            alt={newsItem.title}
                            width={80}
                            height={48}
                            className="h-12 w-20 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* 类型 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(newsItem.type)}`}>
                      {getTypeText(newsItem.type)}
                    </span>
                  </td>
                  
                  {/* 作者 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {newsItem.author || '未知'}
                      </div>
                    </div>
                  </td>
                  
                  {/* 状态 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(newsItem.status)}`}>
                      {getStatusText(newsItem.status)}
                    </span>
                  </td>
                  
                  {/* 发布日期 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(newsItem.publishDate)}
                    </div>
                  </td>
                  
                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {newsItem.url && (
                        <a
                          href={newsItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="查看原文"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(newsItem)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="编辑新闻"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(newsItem)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="删除新闻"
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
      {!loading && !error && news && news.length > 0 && (
        <Pagination
          pagination={{
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.totalItems || 0,
            totalPages: pagination.totalPages
          }}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          showQuickJumper
          showSizeChanger
        />
      )}
    </div>
  )
}

export default NewsTable