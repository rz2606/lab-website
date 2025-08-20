import React from 'react'
import { Edit, Trash2, User, GraduationCap, Briefcase, Award } from 'lucide-react'
import type { TeamMember, PaginationInfo } from '@/types/admin'
import { TableLoadingRow } from '../common/LoadingSpinner'
import { TableErrorRow } from '../common/ErrorBoundary'
import Pagination from '../common/Pagination'

interface TeamTableProps {
  teamMembers: TeamMember[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo
  onEdit: (member: TeamMember) => void
  onDelete: (member: TeamMember) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const TeamTable: React.FC<TeamTableProps> = ({
  teamMembers = [],
  loading = false,
  error = null,
  pagination = { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange
}) => {
  // 确保 teamMembers 始终是一个数组
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];
  // 获取成员类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PI':
        return <Award className="h-4 w-4 text-purple-600" />
      case 'researcher':
        return <Briefcase className="h-4 w-4 text-blue-600" />
      case 'graduate':
        return <GraduationCap className="h-4 w-4 text-green-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  // 获取成员类型显示文本
  const getTypeText = (type: string) => {
    switch (type) {
      case 'PI':
        return 'PI'
      case 'researcher':
        return '研究员'
      case 'graduate':
        return '研究生'
      default:
        return type
    }
  }

  // 获取成员类型样式
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'PI':
        return 'bg-purple-100 text-purple-800'
      case 'researcher':
        return 'bg-blue-100 text-blue-800'
      case 'graduate':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('zh-CN')
    } catch {
      return dateString
    }
  }

  // 渲染成员特定信息
  const renderMemberSpecificInfo = (member: TeamMember) => {
    switch (member.type) {
      case 'PI':
        return (
          <div className="text-xs text-gray-500 space-y-1">
            {member.positions && member.positions.length > 0 && (
              <div>职位: {member.positions.join(', ')}</div>
            )}
            {member.awards && member.awards.length > 0 && (
              <div>获奖: {member.awards.slice(0, 2).join(', ')}{member.awards.length > 2 ? '...' : ''}</div>
            )}
          </div>
        )
      case 'researcher':
        return (
          <div className="text-xs text-gray-500">
            {member.direction && <div>研究方向: {member.direction}</div>}
          </div>
        )
      case 'graduate':
        return (
          <div className="text-xs text-gray-500 space-y-1">
            {member.degree && <div>学位: {member.degree}</div>}
            {member.discipline && <div>专业: {member.discipline}</div>}
            {member.advisor && <div>导师: {member.advisor}</div>}
            {member.graduationYear && <div>毕业年份: {member.graduationYear}</div>}
          </div>
        )
      default:
        return null
    }
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
                  成员信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  详细信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
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
              
              {!loading && !error && safeTeamMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无团队成员数据</p>
                  </td>
                </tr>
              )}
              
              {!loading && !error && safeTeamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  {/* 成员信息 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.photo ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={member.photo}
                            alt={member.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center ${member.photo ? 'hidden' : ''}`}>
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        {member.nameEn && (
                          <div className="text-sm text-gray-500">
                            {member.nameEn}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* 类型 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(member.type)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(member.type)}`}>
                        {getTypeText(member.type)}
                      </span>
                    </div>
                  </td>
                  
                  {/* 详细信息 */}
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {renderMemberSpecificInfo(member)}
                    </div>
                  </td>
                  
                  {/* 联系方式 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.email && (
                        <div className="truncate max-w-32" title={member.email}>
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="text-xs text-gray-500">
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* 状态 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? '在职' : '离职'}
                    </span>
                    {member.type === 'graduate' && member.graduationDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        毕业: {formatDate(member.graduationDate)}
                      </div>
                    )}
                  </td>
                  
                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(member)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="编辑成员"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(member)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="删除成员"
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
      {!loading && !error && safeTeamMembers.length > 0 && (
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

export default TeamTable