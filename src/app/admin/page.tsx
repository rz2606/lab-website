'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, FileText, Wrench, Newspaper, UserCheck, Plus, Edit, Trash2, Search, Lock, AlertTriangle } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import TagSelector from '@/components/TagSelector'
import { getCurrentUser, isAdmin, isAuthenticated, clearAuth, getToken } from '@/lib/auth'
import dynamic from 'next/dynamic'

// 动态导入富文本编辑器，避免SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface User {
  id: number
  username: string
  email: string
  roleType: string
  name?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

interface Publication {
  id: number
  title: string
  authors: string
  journal: string
  year: number
  type: string
  content?: string
  createdAt?: string
  updatedAt?: string
}

interface Tool {
  id: number
  name: string
  description: string
  category: string
  url?: string
  image?: string
  reference?: string
  tags?: string
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

interface News {
  id: number
  title: string
  summary?: string
  content: string
  image?: string
  isPinned?: boolean
  createdAt: string
  updatedAt?: string
}

// 统一的团队成员接口
interface TeamMember {
  id: number
  name: string
  photo?: string
  email: string
  type: 'pi' | 'researcher' | 'graduate'
  // PI特有字段
  title?: string
  experience?: string
  positions?: string
  awards?: string
  papers?: string
  // 研究人员特有字段
  direction?: string
  // 毕业生特有字段
  position?: string
  company?: string
  graduationYear?: number
}

export default function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [hasAdminAccess, setHasAdminAccess] = useState(false)
  
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<User[]>([])
  const [publications, setPublications] = useState<Publication[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [news, setNews] = useState<News[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedMemberType, setSelectedMemberType] = useState<'pi' | 'researcher' | 'graduate'>('pi')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit'>('create')
  const [editingItem, setEditingItem] = useState<any>(null)

  // 权限检查
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const user = getCurrentUser()
      const adminAccess = isAdmin()
      
      setCurrentUser(user)
      setHasAdminAccess(adminAccess)
      setAuthChecked(true)
      
      // 如果未登录，跳转到登录页
      if (!authenticated) {
        router.push('/login')
        return
      }
      
      // 如果不是管理员，显示权限不足提示
      if (!adminAccess) {
        // 不跳转，而是显示权限不足的界面
        return
      }
    }
    
    checkAuth()
  }, [])

  // 退出登录
  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  // 通用API请求函数（包含认证头）
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    // 如果token过期或无效，跳转到登录页
    if (response.status === 401) {
      clearAuth()
      router.push('/login')
      throw new Error('认证失败，请重新登录')
    }
    
    // 如果权限不足，显示错误
    if (response.status === 403) {
      throw new Error('权限不足')
    }
    
    return response
  }

  // 获取数据
  const fetchData = async (type: string) => {
    setLoading(true)
    try {
      if (type === 'team') {
        // 获取所有团队成员数据
        const [piRes, researchersRes, graduatesRes] = await Promise.all([
          apiRequest('/api/team/pi'),
          apiRequest('/api/team/researchers'),
          apiRequest('/api/team/graduates')
        ])
        
        const [piData, researchersData, graduatesData] = await Promise.all([
          piRes.json(),
          researchersRes.json(),
          graduatesRes.json()
        ])
        
        // 合并所有团队成员数据
        const allMembers: TeamMember[] = [
          ...(Array.isArray(piData) ? piData : piData ? [piData] : []).map((pi: any) => ({ ...pi, type: 'pi' as const })),
          ...researchersData.map((researcher: any) => ({ ...researcher, type: 'researcher' as const })),
          ...graduatesData.map((graduate: any) => ({ ...graduate, type: 'graduate' as const }))
        ]
        
        setTeamMembers(allMembers)
        setLoading(false)
        return
      }
      
      let endpoint = ''
      switch (type) {
        case 'users':
          endpoint = '/api/users'
          break
        case 'publications':
          endpoint = '/api/publications'
          break
        case 'tools':
          endpoint = '/api/tools'
          break
        case 'news':
          endpoint = '/api/news'
          break
      }
      
      const response = await apiRequest(endpoint)
      const data = await response.json()
      
      switch (type) {
        case 'users':
          setUsers(data)
          break
        case 'publications':
          setPublications(data)
          break
        case 'tools':
          setTools(data)
          break
        case 'news':
          // 确保data是数组，如果不是则设置为空数组
          setNews(Array.isArray(data) ? data : [])
          break
      }
    } catch (error) {
      console.error(`获取${type}数据失败:`, error)
      // 在错误情况下，确保相关状态被重置为空数组
      switch (type) {
        case 'users':
          setUsers([])
          break
        case 'publications':
          setPublications([])
          break
        case 'tools':
          setTools([])
          break
        case 'news':
          setNews([])
          break
      }
    } finally {
      setLoading(false)
    }
  }

  // 删除操作
  const handleDelete = async (id: number, type: string) => {
    if (!confirm('确定要删除这条记录吗？')) return
    
    try {
      const response = await apiRequest(`/api/${type}/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchData(activeTab)
        alert('删除成功')
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  // 编辑操作
  const handleEdit = (item: any) => {
    setEditingItem(item)
    setModalType('edit')
    setShowModal(true)
  }

  // 创建操作
  const handleCreate = () => {
    // 只在团队管理标签页检查PI唯一性约束
    if (activeTab === 'team' && selectedMemberType === 'pi') {
      const existingPI = teamMembers.find(member => member.type === 'pi')
      if (existingPI) {
        alert('已存在课题组负责人，请先删除现有负责人或直接编辑现有负责人信息')
        return
      }
    }
    
    setEditingItem(null)
    setModalType('create')
    setShowModal(true)
  }

  // 处理用户表单提交
  const handleUserSubmit = async (userData: any) => {
    try {
      const url = modalType === 'create' ? '/api/users' : `/api/users/${editingItem?.id}`
      const method = modalType === 'create' ? 'POST' : 'PUT'
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        setShowModal(false)
        fetchData('users')
        alert(modalType === 'create' ? '用户创建成功' : '用户更新成功')
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  // 处理团队成员表单提交
  const handleTeamMemberSubmit = async (memberData: any) => {
    try {
      let url = ''
      let method = modalType === 'create' ? 'POST' : 'PUT'
      
      // 根据成员类型确定API端点
      switch (memberData.type) {
        case 'pi':
          url = modalType === 'create' ? '/api/team/pi' : `/api/team/pi/${editingItem?.id}`
          break
        case 'researcher':
          url = modalType === 'create' ? '/api/team/researchers' : `/api/team/researchers/${editingItem?.id}`
          break
        case 'graduate':
          url = modalType === 'create' ? '/api/team/graduates' : `/api/team/graduates/${editingItem?.id}`
          break
      }
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(memberData)
      })
      
      if (response.ok) {
        setShowModal(false)
        fetchData('team')
        alert(modalType === 'create' ? '团队成员创建成功' : '团队成员更新成功')
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  // 处理发表成果表单提交
  const handlePublicationSubmit = async (publicationData: any) => {
    try {
      const url = modalType === 'create' ? '/api/publications' : `/api/publications/${editingItem?.id}`
      const method = modalType === 'create' ? 'POST' : 'PUT'
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(publicationData)
      })
      
      if (response.ok) {
        setShowModal(false)
        fetchData('publications')
        alert(modalType === 'create' ? '发表成果创建成功' : '发表成果更新成功')
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  // 处理开发工具表单提交
  const handleToolSubmit = async (toolData: any) => {
    try {
      const url = modalType === 'create' ? '/api/tools' : `/api/tools/${editingItem?.id}`
      const method = modalType === 'create' ? 'POST' : 'PUT'
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(toolData)
      })
      
      if (response.ok) {
        setShowModal(false)
        fetchData('tools')
        alert(modalType === 'create' ? '开发工具创建成功' : '开发工具更新成功')
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  // 处理新闻表单提交
  const handleNewsSubmit = async (newsData: any) => {
    try {
      const url = modalType === 'create' ? '/api/news' : `/api/news/${editingItem?.id}`
      const method = modalType === 'create' ? 'POST' : 'PUT'
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(newsData)
      })
      
      if (response.ok) {
        setShowModal(false)
        fetchData('news')
        alert(modalType === 'create' ? '新闻创建成功' : '新闻更新成功')
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  const tabs = [
    { id: 'users', name: '用户管理', icon: Users },
    { id: 'team', name: '团队管理', icon: UserCheck },
    { id: 'publications', name: '发表成果', icon: FileText },
    { id: 'tools', name: '开发工具', icon: Wrench },
    { id: 'news', name: '新闻动态', icon: Newspaper }
  ]

  // 过滤团队成员
  const filteredTeamMembers = teamMembers.filter(member => member.type === selectedMemberType)

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'users':
        return renderUserTable()
      case 'team':
        return renderTeamTable()
      case 'publications':
        return renderPublicationTable()
      case 'tools':
        return renderToolTable()
      case 'news':
        return renderNewsTable()
      default:
        return <div>选择一个管理模块</div>
    }
  }

  const renderUserTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">用户列表</h3>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加用户
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.roleType === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.roleType === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isActive ? '活跃' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id, 'users')}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderTeamTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">团队管理</h3>
          <button 
            onClick={handleCreate}
            className={`px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 ${
              selectedMemberType === 'pi' && teamMembers.some(member => member.type === 'pi')
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white'
            }`}
            disabled={selectedMemberType === 'pi' && teamMembers.some(member => member.type === 'pi')}
          >
            <Plus className="h-4 w-4" />
            {selectedMemberType === 'pi' && teamMembers.some(member => member.type === 'pi') 
              ? '已有负责人' 
              : '添加成员'
            }
          </button>
        </div>
        
        {/* 类型选择器 */}
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedMemberType('pi')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedMemberType === 'pi'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            课题组负责人
          </button>
          <button
            onClick={() => setSelectedMemberType('researcher')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedMemberType === 'researcher'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            研究人员
          </button>
          <button
            onClick={() => setSelectedMemberType('graduate')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedMemberType === 'graduate'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            毕业生
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
              {selectedMemberType === 'pi' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">职称</th>
              )}
              {selectedMemberType === 'researcher' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">研究方向</th>
              )}
              {selectedMemberType === 'graduate' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">职位</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司</th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeamMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {member.photo && (
                      <img className="h-10 w-10 rounded-full mr-3" src={member.photo} alt={member.name} />
                    )}
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                {selectedMemberType === 'pi' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.title}</td>
                )}
                {selectedMemberType === 'researcher' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.direction}</td>
                )}
                {selectedMemberType === 'graduate' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.company}</td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(member)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const apiType = member.type === 'pi' ? 'team/pi' : 
                                     member.type === 'researcher' ? 'team/researchers' : 'team/graduates'
                      handleDelete(member.id, apiType)
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderPublicationTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">发表成果</h3>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加成果
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期刊</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年份</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {publications.map((publication) => (
              <tr key={publication.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{publication.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{publication.authors}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{publication.journal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{publication.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{publication.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(publication)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(publication.id, 'publications')}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderToolTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">开发工具</h3>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加工具
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tools.map((tool) => (
              <tr key={tool.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tool.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{tool.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tool.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {tool.url ? '可访问' : '开发中'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(tool)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(tool.id, 'tools')}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderNewsTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">新闻动态</h3>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加新闻
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">摘要</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {news.map((item) => (
              <tr key={item.id} className={item.isPinned ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                  <div className="flex items-center gap-2">
                    {item.isPinned && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        置顶
                      </span>
                    )}
                    {item.title}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.summary || '无摘要'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.isPinned ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      已置顶
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      普通
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id, 'news')}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // 权限检查加载状态
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证权限...</p>
        </div>
      </div>
    )
  }

  // 权限不足提示
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">访问受限</h2>
            <p className="text-gray-600 mb-4">
              抱歉，您没有访问管理后台的权限。只有管理员用户才能访问此页面。
            </p>
            {currentUser && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">当前用户：</span> {currentUser.username}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">用户角色：</span> 
                  <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                    currentUser.roleType === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {currentUser.roleType === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                返回首页
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                切换账户
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    欢迎，<span className="font-medium">{currentUser.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 侧边栏 */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">管理菜单</h2>
                <ul className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {tab.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </nav>
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* 用户管理模态框 */}
      {showModal && activeTab === 'users' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'create' ? '添加用户' : '编辑用户'}
              </h3>
              <UserForm 
                user={editingItem}
                onSubmit={handleUserSubmit}
                onCancel={() => setShowModal(false)}
                isEditing={modalType === 'edit'}
              />
            </div>
          </div>
        </div>
      )}

      {/* 团队管理模态框 */}
      {showModal && activeTab === 'team' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'create' ? '添加团队成员' : '编辑团队成员'}
              </h3>
              <TeamMemberForm 
                member={editingItem}
                onSubmit={handleTeamMemberSubmit}
                onCancel={() => setShowModal(false)}
                isEditing={modalType === 'edit'}
                defaultType={selectedMemberType}
              />
            </div>
          </div>
        </div>
      )}

      {/* 发表成果管理模态框 */}
      {showModal && activeTab === 'publications' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'create' ? '添加发表成果' : '编辑发表成果'}
              </h3>
              <PublicationForm 
                publication={editingItem}
                onSubmit={handlePublicationSubmit}
                onCancel={() => setShowModal(false)}
                isEditing={modalType === 'edit'}
              />
            </div>
          </div>
        </div>
      )}

      {/* 开发工具管理模态框 */}
      {showModal && activeTab === 'tools' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'create' ? '添加开发工具' : '编辑开发工具'}
              </h3>
              <ToolForm 
                tool={editingItem}
                onSubmit={handleToolSubmit}
                onCancel={() => setShowModal(false)}
                isEditing={modalType === 'edit'}
              />
            </div>
          </div>
        </div>
      )}

      {/* 新闻管理模态框 */}
      {showModal && activeTab === 'news' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'create' ? '添加新闻' : '编辑新闻'}
              </h3>
              <NewsForm 
                news={editingItem}
                onSubmit={handleNewsSubmit}
                onCancel={() => setShowModal(false)}
                isEditing={modalType === 'edit'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 用户表单组件
function UserForm({ user, onSubmit, onCancel, isEditing }: {
  user?: User | null
  onSubmit: (userData: Record<string, unknown>) => void
  onCancel: () => void
  isEditing: boolean
}) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    roleType: user?.roleType || 'user',
    isActive: user?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          用户名 *
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          邮箱 *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          姓名
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          密码 {isEditing ? '(留空则不修改)' : '*'}
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required={!isEditing}
          placeholder={isEditing ? '留空则不修改密码' : '请输入密码'}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          角色类型
        </label>
        <select
          value={formData.roleType}
          onChange={(e) => setFormData({...formData, roleType: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          启用用户
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isEditing ? '更新' : '创建'}
        </button>
      </div>
    </form>
  )
}

// 新闻表单组件
function NewsForm({ news, onSubmit, onCancel, isEditing }: {
  news?: News | null
  onSubmit: (newsData: Record<string, unknown>) => void
  onCancel: () => void
  isEditing: boolean
}) {
  const [formData, setFormData] = useState({
    title: news?.title || '',
    summary: news?.summary || '',
    content: news?.content || '',
    image: news?.image || '',
    isPinned: news?.isPinned || false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('标题和内容为必填项')
      return
    }
    onSubmit(formData)
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标题 *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          摘要
        </label>
        <textarea
          value={formData.summary}
          onChange={(e) => setFormData({...formData, summary: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入新闻摘要..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          封面图片
        </label>
        <FileUpload
           onChange={handleImageUpload}
           accept="image/*"
           value={formData.image}
         />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          内容 *
        </label>
        <div className="border border-gray-300 rounded-md">
          <MDEditor
             value={formData.content}
             onChange={(value) => setFormData({...formData, content: value || ''})}
             preview="edit"
             hideToolbar={false}
             visibleDragbar={false}
             textareaProps={{
               placeholder: '请输入新闻内容，支持Markdown格式...',
               style: { fontSize: 14, lineHeight: 1.6 }
             }}
             height={400}
           />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          支持Markdown格式，可以插入图片、链接等富文本内容
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isPinned}
            onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">置顶新闻</span>
        </label>
        <p className="text-sm text-gray-500 mt-1">
          置顶的新闻将显示在新闻列表的最前面
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isEditing ? '更新' : '创建'}
        </button>
      </div>
    </form>
  )
}

// 发表成果表单组件
function PublicationForm({ publication, onSubmit, onCancel, isEditing }: {
  publication?: Publication | null
  onSubmit: (publicationData: Record<string, unknown>) => void
  onCancel: () => void
  isEditing: boolean
}) {
  const [formData, setFormData] = useState({
    title: publication?.title || '',
    authors: publication?.authors || '',
    journal: publication?.journal || '',
    year: publication?.year || new Date().getFullYear(),
    type: publication?.type || 'paper',
    content: publication?.content || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          类型 *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="paper">学术论文</option>
          <option value="patent">专利</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标题 *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {formData.type === 'paper' ? '作者' : '发明人'} *
        </label>
        <input
          type="text"
          value={formData.authors}
          onChange={(e) => setFormData({...formData, authors: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="多个作者请用逗号分隔"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {formData.type === 'paper' ? '期刊/会议' : '专利号'} *
        </label>
        <input
          type="text"
          value={formData.journal}
          onChange={(e) => setFormData({...formData, journal: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          年份 *
        </label>
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          min="1900"
          max="2100"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {formData.type === 'paper' ? '摘要' : '描述'}
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder={formData.type === 'paper' ? '请输入论文摘要...' : '请输入专利描述...'}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isEditing ? '更新' : '创建'}
        </button>
      </div>
    </form>
  )
}

// 开发工具表单组件
function ToolForm({ tool, onSubmit, onCancel, isEditing }: {
  tool?: Tool | null
  onSubmit: (toolData: Record<string, unknown>) => void
  onCancel: () => void
  isEditing: boolean
}) {
  const [formData, setFormData] = useState({
    name: tool?.name || '',
    description: tool?.description || '',
    category: tool?.category || '',
    url: tool?.url || '',
    image: tool?.image || '',
    reference: tool?.reference || '',
    tags: tool?.tags || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工具名称 *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工具描述 *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">选择分类</option>
          <option value="数据分析">数据分析</option>
          <option value="分子设计">分子设计</option>
          <option value="人工智能">人工智能</option>
          <option value="数据库">数据库</option>
          <option value="结构预测">结构预测</option>
          <option value="可视化">可视化</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工具链接
        </label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({...formData, url: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工具图片
        </label>
        <FileUpload
          onChange={(url) => setFormData({...formData, image: url})}
          value={formData.image}
          accept="image/*"
          maxSize={5}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          相关论文引用
        </label>
        <input
          type="text"
          value={formData.reference}
          onChange={(e) => setFormData({...formData, reference: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="相关论文引用"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标签
        </label>
        <TagSelector
          value={formData.tags}
          onChange={(value) => setFormData({...formData, tags: value})}
          placeholder="选择或输入标签..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isEditing ? '更新' : '创建'}
        </button>
      </div>
    </form>
  )
}

// 团队成员表单组件
function TeamMemberForm({ member, onSubmit, onCancel, isEditing, defaultType }: {
  member?: TeamMember | null
  onSubmit: (memberData: Record<string, unknown>) => void
  onCancel: () => void
  isEditing: boolean
  defaultType: 'pi' | 'researcher' | 'graduate'
}) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    photo: member?.photo || '',
    type: member?.type || defaultType,
    // PI字段
    title: member?.title || '',
    experience: member?.experience || '',
    positions: member?.positions || '',
    awards: member?.awards || '',
    papers: member?.papers || '',
    // 研究人员字段
    direction: member?.direction || '',
    // 毕业生字段
    position: member?.position || '',
    company: member?.company || '',
    graduationYear: member?.graduationYear || new Date().getFullYear()
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 成员类型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          成员类型 *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value as 'pi' | 'researcher' | 'graduate'})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="pi">课题组负责人</option>
          <option value="researcher">研究人员</option>
          <option value="graduate">毕业生</option>
        </select>
      </div>
      
      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            姓名 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮箱 *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
      
      {/* 头像上传 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          头像
        </label>
        <FileUpload
          value={formData.photo}
          onChange={(url) => setFormData({...formData, photo: url})}
          accept="image/*"
          maxSize={5}
          placeholder="点击上传头像或拖拽图片到此处"
          showPreview={true}
        />
      </div>
      
      {/* PI特有字段 */}
      {formData.type === 'pi' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              职称 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工作经历
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              学术职务
            </label>
            <textarea
              value={formData.positions}
              onChange={(e) => setFormData({...formData, positions: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              获奖情况
            </label>
            <textarea
              value={formData.awards}
              onChange={(e) => setFormData({...formData, awards: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              代表性论文
            </label>
            <textarea
              value={formData.papers}
              onChange={(e) => setFormData({...formData, papers: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </>
      )}
      
      {/* 研究人员特有字段 */}
      {formData.type === 'researcher' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            研究方向
          </label>
          <input
            type="text"
            value={formData.direction}
            onChange={(e) => setFormData({...formData, direction: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
      
      {/* 毕业生特有字段 */}
      {formData.type === 'graduate' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                职位
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公司
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              毕业年份
            </label>
            <input
              type="number"
              value={formData.graduationYear}
              onChange={(e) => setFormData({...formData, graduationYear: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="1900"
              max={new Date().getFullYear() + 10}
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isEditing ? '更新' : '创建'}
        </button>
      </div>
    </form>
  )
}