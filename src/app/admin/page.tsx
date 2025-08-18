'use client'

import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Users, FileText, Wrench, Newspaper, UserCheck, Plus, Edit, Trash2, Search, Lock, AlertTriangle, Upload, Award, X, Eye } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import TagSelector from '@/components/TagSelector'
import { getCurrentUser, isAdmin, isAuthenticated, clearAuth, getToken } from '@/lib/auth'
import dynamic from 'next/dynamic'
import * as XLSX from 'xlsx'

// 错误边界组件
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin页面错误:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">页面加载错误</h2>
            </div>
            <p className="text-gray-600 mb-4">
              页面遇到了一个错误，可能是由于缓存问题导致的。请尝试刷新页面。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

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
  hasPaper?: boolean
}

// 获奖名单接口
interface AwardWinner {
  id: number
  serialNumber?: string
  awardee: string // 获奖人员
  awardDate?: string // 获奖时间
  awardName?: string // 获奖名称及等级
  advisor?: string // 指导老师
  remarks?: string // 备注
  createdAt?: string
  updatedAt?: string
  createdBy?: number
  updatedBy?: number
}

// 工作表信息接口
interface WorksheetInfo {
  name: string
  data: any[][]
  previewData: any[][]
}

// Excel文件解析结果接口
interface ExcelParseResult {
  worksheets: WorksheetInfo[]
  fileName: string
}

function AdminPage() {
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
  const [awards, setAwards] = useState<AwardWinner[]>([])
  const [selectedMemberType, setSelectedMemberType] = useState<'pi' | 'researcher' | 'graduate'>('pi')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit'>('create')
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Excel导入相关状态
  const graduateFileInputRef = useRef<HTMLInputElement>(null)
  const awardFileInputRef = useRef<HTMLInputElement>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{success: boolean, message: string, count?: number} | null>(null)
  
  // 强制刷新状态
  const [forceRefresh, setForceRefresh] = useState(0)
  
  // 获奖名单表单状态
  const [showAwardForm, setShowAwardForm] = useState(false)
  const [editingAward, setEditingAward] = useState<AwardWinner | null>(null)
  
  // 工作表选择相关状态
  const [showWorksheetModal, setShowWorksheetModal] = useState(false)
  const [excelParseResult, setExcelParseResult] = useState<ExcelParseResult | null>(null)
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('')
  const [importType, setImportType] = useState<'graduate' | 'award'>('graduate')
  
  // 确保refs正确初始化和调试信息
  useEffect(() => {
    // 调试信息：检查refs初始化状态
    console.log('Admin页面Refs初始化状态:', {
      awardFileInputRef: !!awardFileInputRef.current,
      graduateFileInputRef: !!graduateFileInputRef.current,
      forceRefresh,
      timestamp: new Date().toISOString()
    })
    
    // 如果refs未正确初始化，强制重新渲染
    if (!awardFileInputRef.current || !graduateFileInputRef.current) {
      console.warn('检测到refs未正确初始化，将在下次渲染周期重试')
    }
  }, [forceRefresh])

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
        case 'awards':
          endpoint = '/api/awards'
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
        case 'awards':
          setAwards(Array.isArray(data) ? data : [])
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
        case 'awards':
          setAwards([])
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
      
      console.log('提交用户数据:', { url, method, userData, editingItem })
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        setShowModal(false)
        fetchData('users')
        alert(modalType === 'create' ? '用户创建成功' : '用户更新成功')
      } else {
        const errorData = await response.text()
        console.error('API响应错误:', { status: response.status, statusText: response.statusText, errorData })
        alert(`操作失败: ${response.status} ${response.statusText}${errorData ? ' - ' + errorData : ''}`)
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert(`操作失败: ${error instanceof Error ? error.message : '未知错误'}`)
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

  // 处理获奖名单表单提交
  const handleAwardSubmit = async (awardData: any) => {
    try {
      const url = editingAward ? `/api/awards/${editingAward.id}` : '/api/awards'
      const method = editingAward ? 'PUT' : 'POST'
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(awardData)
      })
      
      if (response.ok) {
        setShowAwardForm(false)
        setEditingAward(null)
        fetchData('awards')
        alert(editingAward ? '获奖记录更新成功' : '获奖记录创建成功')
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  // 获奖名单CRUD操作
  const handleCreateAward = () => {
    setEditingAward(null)
    setShowAwardForm(true)
  }

  const handleEditAward = (award: AwardWinner) => {
    setEditingAward(award)
    setShowAwardForm(true)
  }

  const handleDeleteAward = async (id: number) => {
    if (!confirm('确定要删除这条获奖记录吗？')) return
    
    try {
      const response = await apiRequest(`/api/awards/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchData('awards')
        alert('删除成功')
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  // 解析Excel文件并提取工作表信息
  const parseExcelFile = async (file: File): Promise<ExcelParseResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          const worksheets: WorksheetInfo[] = workbook.SheetNames.map(sheetName => {
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
            
            // 获取所有数据作为预览数据
            const previewData = jsonData
            
            return {
              name: sheetName,
              data: jsonData,
              previewData
            }
          })
          
          resolve({
            worksheets,
            fileName: file.name
          })
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }

  // 处理毕业生Excel文件上传
  const handleGraduateFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('请选择Excel文件（.xlsx或.xls格式）')
      return
    }

    setImportLoading(true)
    setImportResult(null)

    try {
      // 解析Excel文件
      const parseResult = await parseExcelFile(file)
      
      // 如果只有一个工作表，直接导入
      if (parseResult.worksheets.length === 1) {
        await importGraduateData(parseResult.worksheets[0].data, file)
      } else {
        // 多个工作表，显示选择模态框
        setExcelParseResult(parseResult)
        setImportType('graduate')
        setSelectedWorksheet('')
        setShowWorksheetModal(true)
      }
    } catch (error) {
      console.error('文件解析失败:', error)
      setImportResult({
        success: false,
        message: '文件解析失败，请检查文件格式'
      })
    } finally {
      setImportLoading(false)
      // 清空文件输入
      if (graduateFileInputRef.current) {
        graduateFileInputRef.current.value = ''
      }
    }
  }

  // 处理获奖名单Excel文件上传
  const handleAwardFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('请选择Excel文件（.xlsx或.xls格式）')
      return
    }

    setImportLoading(true)
    setImportResult(null)

    try {
      // 解析Excel文件
      const parseResult = await parseExcelFile(file)
      
      // 如果只有一个工作表，直接导入
      if (parseResult.worksheets.length === 1) {
        await importAwardData(parseResult.worksheets[0].data, file)
      } else {
        // 多个工作表，显示选择模态框
        setExcelParseResult(parseResult)
        setImportType('award')
        setSelectedWorksheet('')
        setShowWorksheetModal(true)
      }
    } catch (error) {
      console.error('文件解析失败:', error)
      setImportResult({
        success: false,
        message: '文件解析失败，请检查文件格式'
      })
    } finally {
      setImportLoading(false)
      // 清空文件输入
      if (awardFileInputRef.current) {
        awardFileInputRef.current.value = ''
      }
    }
  }

  // 导入毕业生数据
  const importGraduateData = async (data: any[][], file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = getToken()
      const response = await fetch('/api/team/graduates/import', {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult({
          success: true,
          message: `成功导入 ${result.count} 条毕业生记录`,
          count: result.count
        })
        // 刷新团队数据
        fetchData('team')
      } else {
        setImportResult({
          success: false,
          message: result.error || '导入失败'
        })
      }
    } catch (error) {
      console.error('导入失败:', error)
      setImportResult({
        success: false,
        message: '导入失败，请检查文件格式和网络连接'
      })
    }
  }

  // 导入获奖数据
  const importAwardData = async (data: any[][], file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = getToken()
      const response = await fetch('/api/awards/import', {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult({
          success: true,
          message: `成功导入 ${result.count} 条获奖记录`,
          count: result.count
        })
        // 刷新获奖名单数据
        fetchData('awards')
      } else {
        setImportResult({
          success: false,
          message: result.error || '导入失败'
        })
      }
    } catch (error) {
      console.error('导入失败:', error)
      setImportResult({
        success: false,
        message: '导入失败，请检查文件格式和网络连接'
      })
    }
  }

  // 处理工作表选择确认
  const handleWorksheetConfirm = async (worksheetName?: string) => {
    const targetWorksheet = worksheetName || selectedWorksheet
    if (!targetWorksheet || !excelParseResult) {
      alert('请选择一个工作表')
      return
    }

    const selectedSheet = excelParseResult.worksheets.find(ws => ws.name === targetWorksheet)
    if (!selectedSheet) {
      alert('选择的工作表不存在')
      return
    }

    setShowWorksheetModal(false)
    setImportLoading(true)

    try {
      // 创建一个临时文件用于导入
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(selectedSheet.data)
      XLSX.utils.book_append_sheet(workbook, worksheet, selectedSheet.name)
      
      // 生成Excel文件
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const file = new File([blob], excelParseResult.fileName, { type: blob.type })

      if (importType === 'graduate') {
        await importGraduateData(selectedSheet.data, file)
      } else {
        await importAwardData(selectedSheet.data, file)
      }
    } catch (error) {
      console.error('导入失败:', error)
      setImportResult({
        success: false,
        message: '导入失败，请重试'
      })
    } finally {
      setImportLoading(false)
      setExcelParseResult(null)
      setSelectedWorksheet('')
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
    { id: 'news', name: '新闻动态', icon: Newspaper },
    { id: 'awards', name: '获奖名单', icon: Award }
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
      case 'awards':
        return renderAwardTable()
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
          <div className="flex gap-2">
            {selectedMemberType === 'graduate' && (
              <>
                <input
                  type="file"
                  ref={graduateFileInputRef}
                  onChange={handleGraduateFileUpload}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
                <button
                  onClick={() => graduateFileInputRef.current?.click()}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  导入Excel
                </button>
              </>
            )}
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
        
        {/* 导入结果显示 */}
        {selectedMemberType === 'graduate' && importResult && (
          <div className={`mt-4 p-4 rounded-md ${
            importResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {importResult.success ? (
                <div className="text-green-600 mr-2">✓</div>
              ) : (
                <div className="text-red-600 mr-2">✗</div>
              )}
              <span className={`text-sm font-medium ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.message}
              </span>
              <button
                onClick={() => setImportResult(null)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {/* 导入加载状态 */}
        {selectedMemberType === 'graduate' && importLoading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-800">正在导入Excel文件，请稍候...</span>
            </div>
          </div>
        )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">是否有论文</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.hasPaper === true ? 'bg-green-100 text-green-800' : 
                        member.hasPaper === false ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.hasPaper === true ? '是' : member.hasPaper === false ? '否' : '未知'}
                      </span>
                    </td>
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

  // 渲染获奖名单表格
  const renderAwardTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        {/* 调试信息和强制刷新 */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex justify-between items-center">
            <div className="text-sm text-yellow-800">
              <span>调试信息: awardFileInputRef状态 - {awardFileInputRef.current ? '已初始化' : '未初始化'}</span>
            </div>
            <button
              onClick={() => {
                setForceRefresh(prev => prev + 1)
                window.location.reload()
              }}
              className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
            >
              强制刷新页面
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">获奖名单管理</h3>
          <div className="flex gap-2">
            <input
              type="file"
              ref={awardFileInputRef}
              onChange={handleAwardFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => {
                try {
                  if (awardFileInputRef.current) {
                    awardFileInputRef.current.click()
                  } else {
                    console.error('awardFileInputRef未初始化')
                    alert('文件输入组件未正确初始化，请刷新页面重试')
                  }
                } catch (error) {
                  console.error('点击文件输入时出错:', error)
                  alert('操作失败，请刷新页面重试')
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              导入Excel
            </button>
            <button 
              onClick={handleCreateAward}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              添加获奖记录
            </button>
          </div>
        </div>
        
        {/* 导入结果显示 */}
        {importResult && (
          <div className={`mb-4 p-4 rounded-md ${
            importResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {importResult.success ? (
                <div className="text-green-600 mr-2">✓</div>
              ) : (
                <div className="text-red-600 mr-2">✗</div>
              )}
              <span className={`text-sm font-medium ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.message}
              </span>
            </div>
          </div>
        )}
        
        {/* 加载状态 */}
        {importLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm font-medium text-blue-800">正在导入Excel文件...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">获奖人员</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">获奖名称及等级</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">获奖时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指导老师</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {awards.map((award) => (
              <tr key={award.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{award.awardee}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{award.awardName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{award.awardDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{award.advisor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{award.remarks}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEditAward(award)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAward(award.id)}
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



  // 主要的渲染函数
  return (
    <ErrorBoundary>
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

        {/* 模态框等其他组件 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'create' ? '创建' : '编辑'}
                  {activeTab === 'users' && '用户'}
                  {activeTab === 'team' && '团队成员'}
                  {activeTab === 'publications' && '论文'}
                  {activeTab === 'tools' && '开发工具'}
                  {activeTab === 'news' && '新闻'}
                  {activeTab === 'awards' && '获奖者'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {activeTab === 'users' && (
                <UserForm
                  user={editingItem}
                  onSubmit={handleUserSubmit}
                  onCancel={() => setShowModal(false)}
                  isEditing={modalType === 'edit'}
                />
              )}
              
              {activeTab === 'team' && (
                <TeamMemberForm
                  member={editingItem}
                  onSubmit={handleTeamMemberSubmit}
                  onCancel={() => setShowModal(false)}
                  isEditing={modalType === 'edit'}
                  defaultType={selectedMemberType}
                />
              )}
              
              {activeTab === 'publications' && (
                <PublicationForm
                  publication={editingItem}
                  onSubmit={handlePublicationSubmit}
                  onCancel={() => setShowModal(false)}
                  isEditing={modalType === 'edit'}
                />
              )}
              
              {activeTab === 'tools' && (
                <ToolForm
                  tool={editingItem}
                  onSubmit={handleToolSubmit}
                  onCancel={() => setShowModal(false)}
                  isEditing={modalType === 'edit'}
                />
              )}
              
              {activeTab === 'news' && (
                <NewsForm
                  news={editingItem}
                  onSubmit={handleNewsSubmit}
                  onCancel={() => setShowModal(false)}
                  isEditing={modalType === 'edit'}
                />
              )}
              
              {activeTab === 'awards' && (
                <AwardForm
                  award={editingItem}
                  onSubmit={handleAwardSubmit}
                  onCancel={() => setShowModal(false)}
                  isEditing={modalType === 'edit'}
                />
              )}
            </div>
          </div>
        )}
        
        {/* 工作表选择模态框 */}
        <WorksheetSelectionModal
          isOpen={showWorksheetModal}
          onClose={() => {
            setShowWorksheetModal(false)
            setExcelParseResult(null)
            setSelectedWorksheet('')
          }}
          parseResult={excelParseResult}
          onConfirm={handleWorksheetConfirm}
        />
      </div>
    </ErrorBoundary>
  )
} // AdminPage函数结束

// 导出包装了ErrorBoundary的AdminPage组件
export default function WrappedAdminPage() {
  return (
    <ErrorBoundary>
      <AdminPage />
    </ErrorBoundary>
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
    
    // 基本验证
    if (!formData.username.trim()) {
      alert('用户名不能为空')
      return
    }
    
    if (!formData.email.trim()) {
      alert('邮箱不能为空')
      return
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('请输入有效的邮箱地址')
      return
    }
    
    // 创建模式下密码必填
    if (!isEditing && !formData.password.trim()) {
      alert('密码不能为空')
      return
    }
    
    // 提交数据，编辑模式下如果密码为空则不包含密码字段
    const submitData = { ...formData }
    if (isEditing && !formData.password.trim()) {
      delete submitData.password
    }
    
    console.log('表单提交数据:', submitData)
    onSubmit(submitData)
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

// 工作表选择模态框组件
function WorksheetSelectionModal({ 
  isOpen, 
  onClose, 
  parseResult, 
  onConfirm 
}: {
  isOpen: boolean
  onClose: () => void
  parseResult: ExcelParseResult | null
  onConfirm: (worksheetName: string) => void
}) {
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('')
  const [previewData, setPreviewData] = useState<any[]>([])

  useEffect(() => {
    if (parseResult && parseResult.worksheets && parseResult.worksheets.length > 0) {
      const firstWorksheet = parseResult.worksheets[0].name
      setSelectedWorksheet(firstWorksheet)
      // 修复字段名：使用previewData而不是preview
      const previewRows = parseResult.worksheets[0].previewData || []
      // 将二维数组转换为对象数组格式
      const formattedPreview = previewRows.map((row, index) => {
        const obj: any = {}
        row.forEach((cell, cellIndex) => {
          obj[`col_${cellIndex}`] = cell
        })
        return obj
      })
      setPreviewData(formattedPreview)
    } else {
      setSelectedWorksheet('')
      setPreviewData([])
    }
  }, [parseResult])

  const handleWorksheetChange = (worksheetName: string) => {
    setSelectedWorksheet(worksheetName)
    const worksheet = parseResult?.worksheets?.find(w => w.name === worksheetName)
    if (worksheet) {
      // 修复字段名：使用previewData而不是preview
      const previewRows = worksheet.previewData || []
      // 将二维数组转换为对象数组格式
      const formattedPreview = previewRows.map((row, index) => {
        const obj: any = {}
        row.forEach((cell, cellIndex) => {
          obj[`col_${cellIndex}`] = cell
        })
        return obj
      })
      setPreviewData(formattedPreview)
    } else {
      setPreviewData([])
    }
  }

  const handleConfirm = () => {
    if (selectedWorksheet) {
      onConfirm(selectedWorksheet)
    } else {
      alert('请选择一个工作表')
    }
  }

  if (!isOpen || !parseResult) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            选择工作表
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择要导入的工作表：
          </label>
          <select
            value={selectedWorksheet}
            onChange={(e) => handleWorksheetChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {parseResult?.worksheets?.map((worksheet) => (
              <option key={worksheet.name} value={worksheet.name}>
                {worksheet.name} ({worksheet.data.length} 行数据)
              </option>
            )) || []}
          </select>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            数据预览（所有数据）：
          </h4>
          <div className="border border-gray-300 rounded-md max-h-96 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {(previewData || []).map((row, index) => (
                  <tr key={index} className={index === 0 ? 'bg-gray-50' : ''}>
                    {Object.values(row || {}).map((cell: any, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200 last:border-r-0 whitespace-pre-wrap break-words max-w-xs">
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewData.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">该工作表没有数据</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedWorksheet || previewData.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  )
}



// 获奖记录表单组件
function AwardForm({ award, onSubmit, onCancel, isEditing }: {
  award?: AwardWinner | null
  onSubmit: (awardData: Record<string, unknown>) => void
  onCancel: () => void
  isEditing: boolean
}) {
  const [formData, setFormData] = useState({
    awardee: award?.awardee || '',
    awardName: award?.awardName || '',
    awardDate: award?.awardDate || '',
    advisor: award?.advisor || '',
    remarks: award?.remarks || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 基本验证
    if (!formData.awardee.trim()) {
      alert('获奖者姓名不能为空')
      return
    }
    
    if (!formData.awardName.trim()) {
      alert('奖项名称不能为空')
      return
    }
    
    if (!formData.awardDate.trim()) {
      alert('获奖时间不能为空')
      return
    }
    
    console.log('获奖记录表单提交数据:', formData)
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          获奖者姓名 *
        </label>
        <input
          type="text"
          value={formData.awardee}
          onChange={(e) => setFormData({...formData, awardee: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
          placeholder="请输入获奖者姓名"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          奖项名称 *
        </label>
        <input
          type="text"
          value={formData.awardName}
          onChange={(e) => setFormData({...formData, awardName: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
          placeholder="请输入奖项名称"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          获奖时间 *
        </label>
        <input
          type="date"
          value={formData.awardDate}
          onChange={(e) => setFormData({...formData, awardDate: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
          placeholder="请选择获奖时间"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          指导老师
        </label>
        <input
          type="text"
          value={formData.advisor}
          onChange={(e) => setFormData({...formData, advisor: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入指导老师姓名"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          备注
        </label>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData({...formData, remarks: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="请输入备注信息"
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