import React, { useState, useEffect } from 'react'
import { Users, Plus, Upload, Download, Filter } from 'lucide-react'
import type { User } from '@/types/admin'
import UsersTable from '../tables/UsersTable'
import UserForm from '../forms/UserForm'
import AdminModal from '../modals/AdminModal'
import ConfirmModal from '../modals/ConfirmModal'
import SearchBar from '../common/SearchBar'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorBoundary from '../common/ErrorBoundary'
import { usePagination } from '@/hooks/usePagination'
import { useAdminData } from '@/hooks/useAdminData'

interface UsersTabProps {
  className?: string
}

const UsersTab: React.FC<UsersTabProps> = ({ className = '' }) => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    exportUsers,
    importUsers
  } = useAdminData()

  const {
    getPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination()

  const pagination = getPagination('users')
  const { currentPage, pageSize } = pagination

  // 状态管理
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  
  // 排序状态 (暂时注释，未来可能需要)
  // const [sortField, setSortField] = useState<keyof User>('createdAt')
  // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // 模态框状态
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  
  // 操作状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // 初始化数据
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // 过滤和排序用户数据
  const filteredAndSortedUsers = React.useMemo(() => {
    if (!users || !Array.isArray(users)) return []
    
    // 过滤
    const filtered = users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = !filterRole || user.role === filterRole
      const matchesStatus = !filterStatus || user.status === filterStatus
      
      return matchesSearch && matchesRole && matchesStatus
    })

    return filtered
  }, [users, searchTerm, filterRole, filterStatus])

  // 计算分页数据
  const paginatedData = React.useMemo(() => {
    if (!filteredAndSortedUsers || !Array.isArray(filteredAndSortedUsers)) return []
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedUsers.slice(startIndex, endIndex)
  }, [filteredAndSortedUsers, currentPage, pageSize])

  // 重置分页当过滤条件改变时
  useEffect(() => {
    resetPagination('users')
  }, [searchTerm, filterRole, filterStatus, resetPagination])

  // 处理搜索
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // 处理排序
  // const handleSort = (field: keyof User) => {
  //   if (field === sortField) {
  //     setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  //   } else {
  //     setSortField(field)
  //     setSortDirection('asc')
  //   }
  // }

  // 处理用户选择
  // const handleUserSelect = (userId: string, selected: boolean) => {
  //   setSelectedUsers(prev => 
  //     selected 
  //       ? [...prev, userId]
  //       : prev.filter(id => id !== userId)
  //   )
  // }

  // 处理全选
  // const handleSelectAll = (selected: boolean) => {
  //   setSelectedUsers(selected ? paginatedData.map(user => user.id) : [])
  // }

  // 打开新增用户模态框
  const handleAddUser = () => {
    setEditingUser(null)
    setShowUserModal(true)
  }

  // 打开编辑用户模态框
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  // 处理用户表单提交
  const handleUserSubmit = async (userData: Partial<User>) => {
    setIsSubmitting(true)
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData)
      } else {
        await createUser(userData)
      }
      setShowUserModal(false)
      setEditingUser(null)
      await fetchUsers() // 刷新数据
    } catch (error) {
      console.error('保存用户失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 打开删除确认模态框
  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
    setShowDeleteModal(true)
  }

  // 确认删除用户
  const confirmDeleteUser = async () => {
    if (!deletingUser) return
    
    setIsDeleting(true)
    try {
      await deleteUser(deletingUser.id)
      setShowDeleteModal(false)
      setDeletingUser(null)
      await fetchUsers() // 刷新数据
    } catch (error) {
      console.error('删除用户失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedUsers.length === 0) return
    setShowBatchDeleteModal(true)
  }

  // 确认批量删除
  const confirmBatchDelete = async () => {
    setIsDeleting(true)
    try {
      await Promise.all(selectedUsers.map(userId => deleteUser(userId)))
      setShowBatchDeleteModal(false)
      setSelectedUsers([])
      await fetchUsers() // 刷新数据
    } catch (error) {
      console.error('批量删除用户失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 导出用户数据
  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportUsers(filteredAndSortedUsers)
    } catch (error) {
      console.error('导出用户数据失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导入用户数据
  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      await importUsers(file)
      await fetchUsers() // 刷新数据
    } catch (error) {
      console.error('导入用户数据失败:', error)
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
    setFilterRole('')
    setFilterStatus('')
    setSelectedUsers([])
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">加载用户数据失败</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={() => fetchUsers()}
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
              <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {filteredAndSortedUsers.length} 个用户
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 批量操作 */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedUsers.length} 个用户
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
                  id="import-users"
                  disabled={isImporting}
                />
                <label
                  htmlFor="import-users"
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
                  disabled={isExporting || filteredAndSortedUsers.length === 0}
                >
                  {isExporting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  导出
                </button>
              </div>
              
              {/* 添加用户按钮 */}
              <button
                onClick={handleAddUser}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加用户
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
                placeholder="搜索用户姓名、邮箱或电话..."
                className="w-full"
              />
            </div>
            
            {/* 过滤器 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有角色</option>
                  <option value="admin">管理员</option>
                  <option value="editor">编辑者</option>
                  <option value="viewer">查看者</option>
                  <option value="user">普通用户</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">所有状态</option>
                  <option value="active">活跃</option>
                  <option value="inactive">非活跃</option>
                  <option value="suspended">已暂停</option>
                  <option value="pending">待激活</option>
                </select>
              </div>
              
              {/* 清除过滤器 */}
              {(searchTerm || filterRole || filterStatus) && (
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

        {/* 用户表格 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="加载用户数据中..." />
          </div>
        ) : (
          <UsersTable
            users={paginatedData}
            loading={loading}
            error={error}
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredAndSortedUsers.length,
              totalPages: Math.ceil(filteredAndSortedUsers.length / pageSize)
            }}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onPageChange={(page) => handlePageChange('users', page)}
            onPageSizeChange={(pageSize) => handlePageSizeChange('users', pageSize)}
          />
        )}

        {/* 用户表单模态框 */}
        <AdminModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false)
            setEditingUser(null)
          }}
          title={editingUser ? '编辑用户' : '添加用户'}
          size="lg"
        >
          <UserForm
            user={editingUser}
            onSubmit={handleUserSubmit}
            onCancel={() => {
              setShowUserModal(false)
              setEditingUser(null)
            }}
            loading={isSubmitting}
          />
        </AdminModal>

        {/* 删除确认模态框 */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingUser(null)
          }}
          onConfirm={confirmDeleteUser}
          title="删除用户"
          message={`确定要删除用户 "${deletingUser?.name}" 吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />

        {/* 批量删除确认模态框 */}
        <ConfirmModal
          isOpen={showBatchDeleteModal}
          onClose={() => setShowBatchDeleteModal(false)}
          onConfirm={confirmBatchDelete}
          title="批量删除用户"
          message={`确定要删除选中的 ${selectedUsers.length} 个用户吗？此操作不可撤销。`}
          type="danger"
          loading={isDeleting}
        />
      </div>
    </ErrorBoundary>
  )
}

export default UsersTab