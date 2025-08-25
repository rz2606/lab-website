import React from 'react'
import Image from 'next/image'
import { Edit, Trash2, Calendar, Newspaper, Pin } from 'lucide-react'
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
                  图片
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  置顶
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <TableLoadingRow colSpan={5} />
              )}
              
              {error && (
                <TableErrorRow 
                  colSpan={5} 
                  message={error}
                />
              )}
              
              {!loading && !error && (!news || news.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
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
                    </div>
                  </td>
                  
                  {/* 图片 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {newsItem.image ? (
                      <div className="w-16 h-12">
                        <Image
                          src={newsItem.image}
                          alt={newsItem.title}
                          width={64}
                          height={48}
                          className="h-12 w-16 object-cover rounded border"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center">
                        <Newspaper className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </td>
                  
                  {/* 置顶状态 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {newsItem.isPinned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Pin className="h-3 w-3 mr-1" />
                        置顶
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">普通</span>
                    )}
                  </td>
                  
                  {/* 创建时间 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(newsItem.createdAt)}
                    </div>
                  </td>
                  
                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
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
            total: pagination.total || 0,
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