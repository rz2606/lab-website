import React from 'react'
import { Edit, Trash2, Award, ExternalLink, Calendar, User, Trophy, Medal } from 'lucide-react'
import type { AwardWinner, PaginationInfo } from '@/types/admin'
import { TableLoadingRow } from '../common/LoadingSpinner'
import { TableErrorRow } from '../common/ErrorBoundary'
import Pagination from '../common/Pagination'

interface AwardsTableProps {
  awards: AwardWinner[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo
  onEdit: (award: AwardWinner) => void
  onDelete: (award: AwardWinner) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const AwardsTable: React.FC<AwardsTableProps> = ({
  awards = [],
  loading = false,
  error = null,
  pagination = { currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 },
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange
}) => {
  // 获取奖项级别样式
  const getLevelBadgeClass = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'international':
        return 'bg-purple-100 text-purple-800'
      case 'national':
        return 'bg-red-100 text-red-800'
      case 'provincial':
        return 'bg-blue-100 text-blue-800'
      case 'municipal':
        return 'bg-green-100 text-green-800'
      case 'institutional':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取奖项级别显示文本
  const getLevelText = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'international':
        return '国际级'
      case 'national':
        return '国家级'
      case 'provincial':
        return '省级'
      case 'municipal':
        return '市级'
      case 'institutional':
        return '校级'
      default:
        return level
    }
  }

  // 获取奖项类型样式
  const getTypeBadgeClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'research':
        return 'bg-blue-100 text-blue-800'
      case 'teaching':
        return 'bg-green-100 text-green-800'
      case 'innovation':
        return 'bg-purple-100 text-purple-800'
      case 'service':
        return 'bg-orange-100 text-orange-800'
      case 'competition':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取奖项类型显示文本
  const getTypeText = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'research':
        return '科研'
      case 'teaching':
        return '教学'
      case 'innovation':
        return '创新'
      case 'service':
        return '服务'
      case 'competition':
        return '竞赛'
      default:
        return type
    }
  }

  // 获取奖项等级图标
  const getRankIcon = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'first':
      case '一等奖':
      case '第一名':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'second':
      case '二等奖':
      case '第二名':
        return <Medal className="h-4 w-4 text-gray-400" />
      case 'third':
      case '三等奖':
      case '第三名':
        return <Medal className="h-4 w-4 text-orange-500" />
      default:
        return <Award className="h-4 w-4 text-blue-500" />
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
    if (text?.length <= maxLength) return text
    return text?.substring(0, maxLength) + '...'
  }

  // 渲染获奖者列表
  const renderWinners = (winners: string[]) => {
    if (!winners || winners.length === 0) return '未知'
    
    if (winners?.length === 1) {
      return winners[0]
    }
    
    if (winners?.length <= 3) {
      return winners.join(', ')
    }
    
    return `${winners.slice(0, 2).join(', ')} 等 ${winners.length} 人`
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
                  奖项信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  级别
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  获奖者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  颁发机构
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  获奖日期
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
                    <Award className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无获奖数据</p>
                  </td>
                </tr>
              )}
              
              {!loading && !error && awards && awards.map((award) => (
                <tr key={award.id} className="hover:bg-gray-50">
                  {/* 奖项信息 */}
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <div className="flex items-center mb-1">
                        {getRankIcon(award.rank)}
                        <div className="ml-2 text-sm font-medium text-gray-900" title={award.awardName}>
                          {truncateText(award.awardName, 30)}
                        </div>
                      </div>
                      {award.rank && (
                        <div className="text-xs text-gray-500 mb-1">
                          {award.rank}
                        </div>
                      )}
                      {award.description && (
                        <div className="text-xs text-gray-500" title={award.description}>
                          {truncateText(award.description, 80)}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* 类型 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(award.type)}`}>
                      {getTypeText(award.type)}
                    </span>
                  </td>
                  
                  {/* 级别 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeClass(award.level)}`}>
                      {getLevelText(award.level)}
                    </span>
                  </td>
                  
                  {/* 获奖者 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900" title={award.winners?.join(', ')}>
                        {renderWinners(award.winners)}
                      </div>
                    </div>
                  </td>
                  
                  {/* 颁发机构 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900" title={award.organization}>
                      {truncateText(award.organization, 20)}
                    </div>
                  </td>
                  
                  {/* 获奖日期 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(award.awardDate)}
                    </div>
                  </td>
                  
                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {award.certificateUrl && (
                        <a
                          href={award.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="查看证书"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
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

export default AwardsTable