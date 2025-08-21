import React from 'react'
import { Edit, Trash2, Award as AwardIcon, Calendar, User } from 'lucide-react'
import type { Award, PaginationInfo } from '@/types/admin'
import { TableLoadingRow } from '../common/LoadingSpinner'
import { TableErrorRow } from '../common/ErrorBoundary'
import Pagination from '../common/Pagination'

interface AwardsTableProps {
  awards: Award[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo
  onEdit: (award: Award) => void
  onDelete: (award: Award) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const AwardsTable: React.FC<AwardsTableProps> = ({
  awards = [],
  loading = false,
  error = null,
  pagination = { currentPage: 1, totalPages: 1, pageSize: 10, total: 0 },
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange
}) => {
  // 格式化日期
  const formatDate = (date: string | null) => {
    if (!date) return '未知'
    return date
  }

  // 截断文本
  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
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
                  序号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  获奖人员
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  获奖时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  获奖名称及等级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指导老师
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  备注
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
              
              {!loading && !error && awards && awards.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AwardIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无获奖数据</p>
                  </td>
                </tr>
              )}
              
              {!loading && !error && awards && awards.map((award) => (
                <tr key={award.id} className="hover:bg-gray-50">
                  {/* 序号 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {award.serialNumber || '-'}
                    </div>
                  </td>
                  
                  {/* 获奖人员 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900" title={award.awardee}>
                        {truncateText(award.awardee, 30)}
                      </div>
                    </div>
                  </td>
                  
                  {/* 获奖时间 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(award.awardDate)}
                    </div>
                  </td>
                  
                  {/* 获奖名称及等级 */}
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <div className="text-sm font-medium text-gray-900" title={award.awardName}>
                        {truncateText(award.awardName, 50)}
                      </div>
                    </div>
                  </td>
                  
                  {/* 指导老师 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {award.advisor || '-'}
                    </div>
                  </td>
                  
                  {/* 备注 */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500" title={award.remarks || ''}>
                      {truncateText(award.remarks, 30) || '-'}
                    </div>
                  </td>
                  
                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(award)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="编辑获奖信息"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(award)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="删除获奖信息"
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
      {!loading && !error && awards && awards.length > 0 && (
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

export default AwardsTable