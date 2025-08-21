import React from 'react'
import { Edit, Trash2, Wrench, ExternalLink, Download, Github, Star } from 'lucide-react'
import type { Tool as ToolType, PaginationInfo } from '@/types/admin'
import { TableLoadingRow } from '../common/LoadingSpinner'
import { TableErrorRow } from '../common/ErrorBoundary'
import Pagination from '../common/Pagination'

interface ToolsTableProps {
  tools: ToolType[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo
  onEdit: (tool: ToolType) => void
  onDelete: (tool: ToolType) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const ToolsTable: React.FC<ToolsTableProps> = ({
  tools = [],
  loading = false,
  error = null,
  pagination = { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange
}) => {
  // 确保 tools 始终是一个数组
  const safeTools = Array.isArray(tools) ? tools : [];
  // 获取工具类型样式
  const getTypeBadgeClass = (type: string) => {
    if (!type) return 'bg-gray-100 text-gray-800'
    
    switch (type.toLowerCase()) {
      case 'software':
        return 'bg-blue-100 text-blue-800'
      case 'library':
        return 'bg-green-100 text-green-800'
      case 'framework':
        return 'bg-purple-100 text-purple-800'
      case 'dataset':
        return 'bg-orange-100 text-orange-800'
      case 'model':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取工具类型显示文本
  const getTypeText = (type: string) => {
    if (!type) return '未知类型'
    
    switch (type.toLowerCase()) {
      case 'software':
        return '软件'
      case 'library':
        return '库'
      case 'framework':
        return '框架'
      case 'dataset':
        return '数据集'
      case 'model':
        return '模型'
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

  // 渲染标签
  const renderTags = (tags: string) => {
    if (!tags) return null
    
    // 处理逗号分隔的字符串
    const tagArray = tags.split(',')
    
    return (
      <div className="flex flex-wrap gap-1">
        {tagArray.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tag.trim()}
          </span>
        ))}
        {tagArray.length > 3 && (
          <span className="text-xs text-gray-500">+{tagArray.length - 3}</span>
        )}
      </div>
    )
  }

  // 渲染链接按钮
  const renderLinkButton = (url: string, icon: React.ReactNode, title: string, color: string) => {
    if (!url) return null
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${color} p-1 rounded transition-colors`}
        title={title}
      >
        {icon}
      </a>
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
                  工具信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  版本信息
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
                <TableLoadingRow colSpan={6} />
              )}
              
              {error && (
                <TableErrorRow 
                  colSpan={6} 
                  message={error}
                />
              )}
              
              {!loading && !error && safeTools.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无工具数据</p>
                  </td>
                </tr>
              )}
              
              {!loading && !error && safeTools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  {/* 工具信息 */}
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <div className="flex items-center mb-1">
                        <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900" title={tool.name}>
                          {truncateText(tool.name, 30)}
                        </div>
                      </div>
                      {tool.description && (
                        <div className="text-xs text-gray-500 mb-1" title={tool.description}>
                          {truncateText(tool.description, 80)}
                        </div>
                      )}
                      {renderTags(tool.tags)}
                    </div>
                  </td>
                  
                  {/* 类型 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(tool.type || '')}`}>
                      {getTypeText(tool.type || '')}
                    </span>
                  </td>
                  
                  {/* 版本信息 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {tool.version && (
                        <div className="font-medium">
                          v{tool.version}
                        </div>
                      )}
                      {tool.license && (
                        <div className="text-xs text-gray-500">
                          {tool.license}
                        </div>
                      )}
                      {!tool.version && !tool.license && (
                        <div className="text-xs text-gray-400">
                          -
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* 统计 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 space-y-1">
                      {tool.downloads !== undefined && (
                        <div className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          <span>{tool.downloads.toLocaleString()}</span>
                        </div>
                      )}
                      {tool.stars !== undefined && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          <span>{tool.stars.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* 发布日期 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tool.releaseDate ? formatDate(tool.releaseDate) : '-'}
                  </td>
                  
                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {renderLinkButton(
                        tool.demoUrl || '',
                        <ExternalLink className="h-4 w-4" />,
                        '查看演示',
                        'text-green-600 hover:text-green-900'
                      )}
                      {renderLinkButton(
                        tool.repository || '',
                        <Github className="h-4 w-4" />,
                        '查看源码',
                        'text-gray-600 hover:text-gray-900'
                      )}
                      {renderLinkButton(
                        tool.downloadUrl || '',
                        <Download className="h-4 w-4" />,
                        '下载',
                        'text-blue-600 hover:text-blue-900'
                      )}
                      <button
                        onClick={() => onEdit(tool)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="编辑工具"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tool)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="删除工具"
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
      {!loading && !error && safeTools.length > 0 && (
        <Pagination
          pagination={{
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: (pagination as any).totalItems || pagination.totalPages * pagination.pageSize || 0,
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

export default ToolsTable