import React from 'react'
import { Edit, Trash2, FileText, ExternalLink, Calendar, Users } from 'lucide-react'
import type { Publication, PaginationInfo } from '@/types/admin'
import { TableLoadingRow } from '../common/LoadingSpinner'
import { TableErrorRow } from '../common/ErrorBoundary'
import Pagination from '../common/Pagination'

interface PublicationsTableProps {
  publications: Publication[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo
  onEdit: (publication: Publication) => void
  onDelete: (publication: Publication) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const PublicationsTable: React.FC<PublicationsTableProps> = ({
  publications = [],
  loading = false,
  error = null,
  pagination = { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange
}) => {
  // 确保 publications 始终是一个数组
  const safePublications = Array.isArray(publications) ? publications : [];
  // 获取发表类型样式
  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'journal':
        return 'bg-blue-100 text-blue-800'
      case 'conference':
        return 'bg-green-100 text-green-800'
      case 'book':
        return 'bg-purple-100 text-purple-800'
      case 'patent':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取发表类型显示文本
  const getTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'journal':
        return '期刊论文'
      case 'conference':
        return '会议论文'
      case 'book':
        return '书籍'
      case 'patent':
        return '专利'
      default:
        return type
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

  // 渲染作者列表
  const renderAuthors = (authors: string) => {
    if (!authors || authors.trim() === '') {
      return <span className="text-gray-400">未知作者</span>;
    }
    // 如果 authors 是字符串，按逗号分割并处理
    const authorList = authors.split(',').map(author => author.trim()).filter(author => author.length > 0);
    return (
      <div className="flex flex-wrap gap-1">
        {authorList.join(', ')}
      </div>
    );
  }

  // 渲染标签
  const renderTags = (tags: string) => {
    if (!tags || tags.trim() === '') return null
    
    // 将字符串按逗号分割成数组，并去除空白
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    
    if (tagArray.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tagArray.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            {tag}
          </span>
        ))}
        {tagArray.length > 3 && (
          <span className="text-xs text-gray-400">+{tagArray.length - 3}</span>
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
                  标题信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发表信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发表日期
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
              
              {!loading && !error && safePublications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无发表成果数据</p>
                  </td>
                </tr>
              )}
              
              {!loading && !error && safePublications.map((publication) => (
                <tr key={publication.id} className="hover:bg-gray-50">
                  {/* 标题信息 */}
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        <span title={publication.title}>
                          {truncateText(publication.title, 60)}
                        </span>
                      </div>
                      {publication.titleEn && (
                        <div className="text-xs text-gray-500 mb-1" title={publication.titleEn}>
                          {truncateText(publication.titleEn, 60)}
                        </div>
                      )}
                      {publication.abstract && (
                        <div className="text-xs text-gray-400" title={publication.abstract}>
                          {truncateText(publication.abstract, 80)}
                        </div>
                      )}
                      {renderTags(publication.tags)}
                    </div>
                  </td>
                  
                  {/* 类型 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(publication.type)}`}>
                      {getTypeText(publication.type)}
                    </span>
                  </td>
                  
                  {/* 作者 */}
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{renderAuthors(publication.authors)}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* 发表信息 */}
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {publication.journal && (
                        <div className="text-sm text-gray-900 font-medium">
                          {publication.journal}
                        </div>
                      )}
                      {publication.conference && (
                        <div className="text-sm text-gray-900 font-medium">
                          {publication.conference}
                        </div>
                      )}
                      {publication.volume && (
                        <div className="text-xs text-gray-500">
                          Vol. {publication.volume}
                          {publication.issue && `, No. ${publication.issue}`}
                          {publication.pages && `, pp. ${publication.pages}`}
                        </div>
                      )}
                      {publication.doi && (
                        <div className="text-xs text-blue-600 truncate" title={publication.doi}>
                          DOI: {publication.doi}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* 发表日期 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(publication.publishedDate)}
                    </div>
                  </td>
                  
                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {publication.url && (
                        <a
                          href={publication.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="查看原文"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(publication)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="编辑发表成果"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(publication)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="删除发表成果"
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
      {!loading && !error && safePublications.length > 0 && (
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

export default PublicationsTable