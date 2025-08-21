import React, { useState, useEffect } from 'react'
import { Users, Plus, Upload, Download, Filter } from 'lucide-react'
import type { TeamMember } from '@/types/admin'
import TeamTable from '../tables/TeamTable'
import TeamMemberForm from '../forms/TeamMemberForm'
import AdminModal from '../modals/AdminModal'
import ConfirmModal from '../modals/ConfirmModal'
import SearchBar from '../common/SearchBar'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBoundary from '../common/ErrorBoundary'
import { usePagination } from '@/hooks/usePagination'
import { useAdminData } from '@/hooks/useAdminData'

interface TeamTabProps {
  className?: string
}

const TeamTab: React.FC<TeamTabProps> = ({ className = '' }) => {
  const {
    teamMembers,
    loading,
    error,
    fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    exportTeamMembers,
    importTeamMembers
  } = useAdminData()

  const {
    getPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination()

  const pagination = getPagination('team')
  const { currentPage, pageSize } = pagination

  // 状态管理
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterDepartment, setFilterDepartment] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  
  // 排序状态 (暂时注释，未来可能需要)
  // const [sortField, setSortField] = useState<keyof TeamMember>('createdAt')
  // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  
  // 模态框状态
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  
  // 操作状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // 初始化数据
  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  // 过滤和排序数据
  const filteredAndSortedMembers = React.useMemo(() => {
    // 确保 teamMembers 存在且为数组
    if (!teamMembers || !Array.isArray(teamMembers)) {
      return []
    }

    const filtered = teamMembers.filter(member => {
      const matchesSearch = !searchTerm || 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.phone && member.phone.includes(searchTerm))
      
      const matchesType = !filterType || member.type === filterType
      const matchesDepartment = !filterDepartment || member.department === filterDepartment
      const matchesStatus = !filterStatus || member.status === filterStatus
      
      return matchesSearch && matchesType && matchesDepartment && matchesStatus
    })

    return filtered
  }, [teamMembers, searchTerm, filterType, filterDepartment, filterStatus])

  // 计算分页数据
  const paginatedData = React.useMemo(() => {
    if (!filteredAndSortedMembers || !Array.isArray(filteredAndSortedMembers)) return []
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedMembers.slice(startIndex, endIndex)
  }, [filteredAndSortedMembers, currentPage, pageSize])

  // 重置分页当过滤条件改变时
  useEffect(() => {
    resetPagination('team')
  }, [searchTerm, filterType, filterDepartment, filterStatus, resetPagination])

  // 处理搜索
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // 处理排序
  // const handleSort = (field: keyof TeamMember) => {
  //   if (field === sortField) {
  //     setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  //   } else {
  //     setSortField(field)
  //     setSortDirection('asc')
  //   }
  // }

  // 处理成员选择
  // const handleMemberSelect = (memberId: string, selected: boolean) => {
  //   setSelectedMembers(prev => 
  //     selected 
  //       ? [...prev, memberId]
  //       : prev.filter(id => id !== memberId)
  //   )
  // }

  // 处理全选
  // const handleSelectAll = (selected: boolean) => {
  //   setSelectedMembers(selected ? paginatedData.map(member => member.id) : [])
  // }

  // 打开新增成员模态框
  const handleAddMember = () => {
    setEditingMember(null)
    setShowMemberModal(true)
  }

  // 打开编辑成员模态框
  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setShowMemberModal(true)
  }

  // 处理成员表单提交
  const handleMemberSubmit = async (memberData: Partial<TeamMember>) => {
    setIsSubmitting(true)
    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, memberData)
      } else {
        await createTeamMember(memberData)
      }
      setShowMemberModal(false)
      setEditingMember(null)
      await fetchTeamMembers() // 刷新数据
    } catch (error) {
      console.error('保存团队成员失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 打开删除确认模态框
  const handleDeleteMember = (member: TeamMember) => {
    setDeletingMember(member)
    setShowDeleteModal(true)
  }

  // 确认删除成员
  const confirmDeleteMember = async () => {
    if (!deletingMember) return
    
    setIsDeleting(true)
    try {
      await deleteTeamMember(deletingMember.id)
      setShowDeleteModal(false)
      setDeletingMember(null)
      await fetchTeamMembers() // 刷新数据
    } catch (error) {
      console.error('删除团队成员失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedMembers.length === 0) return
    setShowBatchDeleteModal(true)
  }

  // 确认批量删除
  const confirmBatchDelete = async () => {
    setIsDeleting(true)
    try {
      await Promise.all(selectedMembers.map(memberId => deleteTeamMember(memberId)))
      setShowBatchDeleteModal(false)
      setSelectedMembers([])
      await fetchTeamMembers() // 刷新数据
    } catch (error) {
      console.error('批量删除团队成员失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 导出团队数据
  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportTeamMembers(filteredAndSortedMembers)
    } catch (error) {
      console.error('导出团队数据失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导入团队数据
  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      await importTeamMembers(file)
      await fetchTeamMembers() // 刷新数据
    } catch (error) {
      console.error('导入团队数据失败:', error)
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
    setFilterDepartment('')
    setFilterStatus('')
    setSelectedMembers([])
  }

  // 获取部门列表
  const departments = React.useMemo(() => {
    const depts = new Set(teamMembers.map(member => member.department).filter(Boolean))
    return Array.from(depts).sort()
  }, [teamMembers])

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">加载团队数据失败</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => fetchTeamMembers()}
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
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">团队管理</h2>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {filteredAndSortedMembers.length} 个成员
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 批量操作 */}
              {selectedMembers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedMembers.length} 个成员
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
                  id="import-team"
                  disabled={isImporting}
                />
                <label
                  htmlFor="import-team"
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
                  disabled={isExporting || filteredAndSortedMembers.length === 0}
                >
                  {isExporting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  导出
                </button>
              </div>
              
              {/* 添加成员按钮 */}
              <button
                onClick={handleAddMember}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加成员
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
                placeholder="搜索成员姓名、邮箱、职位或电话..."
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
                  <option value="faculty">教职工</option>
                  <option value="student">学生</option>
                  <option value="postdoc">博士后</option>
                  <option value="visiting">访问学者</option>
                  <option value="staff">行政人员</option>
                </select>
                
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有部门</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有状态</option>
                  <option value="active">在职</option>
                  <option value="inactive">离职</option>
                  <option value="leave">休假</option>
                  <option value="visiting">访问</option>
                </select>
              </div>
              
              {/* 清除过滤器 */}
              {(searchTerm || filterType || filterDepartment || filterStatus) && (
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

        {/* 团队表格 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="加载团队数据中..." />
          </div>
        ) : (
          <TeamTable
            teamMembers={paginatedData}
            loading={loading}
            error={error}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredAndSortedMembers.length,
              totalPages: Math.ceil(filteredAndSortedMembers.length / pageSize)
            }}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            onPageChange={(page) => handlePageChange('team', page)}
            onPageSizeChange={(pageSize) => handlePageSizeChange('team', pageSize)}
          />
        )}

        {/* 成员表单模态框 */}
        <AdminModal
          isOpen={showMemberModal}
          onClose={() => {
            setShowMemberModal(false)
            setEditingMember(null)
          }}
          title={editingMember ? '编辑团队成员' : '添加团队成员'}
          size="xl"
        >
          <TeamMemberForm
            member={editingMember}
            onSubmit={handleMemberSubmit}
            onCancel={() => {
              setShowMemberModal(false)
              setEditingMember(null)
            }}
            loading={isSubmitting}
          />
        </AdminModal>

        {/* 删除确认模态框 */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingMember(null)
          }}
          onConfirm={confirmDeleteMember}
          title="删除团队成员"
          message={`确定要删除团队成员 "${deletingMember?.name}" 吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />

        {/* 批量删除确认模态框 */}
        <ConfirmModal
          isOpen={showBatchDeleteModal}
          onClose={() => setShowBatchDeleteModal(false)}
          onConfirm={confirmBatchDelete}
          title="批量删除团队成员"
          message={`确定要删除选中的 ${selectedMembers.length} 个团队成员吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />
      </div>
    </ErrorBoundary>
  )
}

export default TeamTab