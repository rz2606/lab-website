import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Publication,
  Tool,
  News,
  TeamMember,
  AwardWinner,
  Article,
  PaginationState,
  AdminTabType,
  ApiResponse
} from '@/types/admin'
import { clearAuth, getToken } from '@/lib/auth'

export const useAdminData = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // 数据状态
  const [users, setUsers] = useState<User[]>([])
  const [publications, setPublications] = useState<Publication[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [news, setNews] = useState<News[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [awards, setAwards] = useState<AwardWinner[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  
  // 分页状态
  const [pagination, setPagination] = useState<PaginationState>({
    users: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0 },
    publications: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0 },
    tools: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0 },
    news: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0 },
    awards: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0 },
    articles: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0 }
  })
  
  // 使用 ref 存储最新的 pagination 状态，避免在 useCallback 依赖项中包含 pagination
  const paginationRef = useRef(pagination)
  
  // 同步更新 ref
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 通用API请求函数（包含认证头）
  const apiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
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
  }, [router])

  // 获取数据（支持分页）
  const fetchData = useCallback(async (
    type: AdminTabType,
    page?: number,
    pageSize?: number,
    search?: string
  ) => {
    setLoading(true)
    try {
      if (type === 'team') {
        // 获取所有团队成员数据（团队数据不分页）
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

        // 处理分页响应格式，提取data字段
        const extractedPiData = piData?.data && Array.isArray(piData.data) ? piData.data :
          (Array.isArray(piData) ? piData : piData ? [piData] : [])
        const extractedResearchersData = researchersData?.data && Array.isArray(researchersData.data) ? researchersData.data :
          (Array.isArray(researchersData) ? researchersData : [])
        const extractedGraduatesData = graduatesData?.data && Array.isArray(graduatesData.data) ? graduatesData.data :
          (Array.isArray(graduatesData) ? graduatesData : [])

        // 合并所有团队成员数据
        const allMembers: TeamMember[] = [
          ...extractedPiData.map((pi: unknown) => ({ ...pi as TeamMember, type: 'pi' as const })),
          ...extractedResearchersData.map((researcher: unknown) => ({ ...researcher as TeamMember, type: 'researcher' as const })),
          ...extractedGraduatesData.map((graduate: unknown) => ({ ...graduate as TeamMember, type: 'graduate' as const }))
        ]

        setTeamMembers(allMembers)
        return
      }

      // 使用 ref 获取最新的分页信息，避免依赖 pagination 状态
      const typePagination = paginationRef.current[type as keyof PaginationState]
      const currentPage = page || typePagination?.currentPage || 1
      const currentPageSize = pageSize || typePagination?.pageSize || 10
      
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
        case 'articles':
          endpoint = '/api/articles'
          break
      }

      // 构建查询参数
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentPageSize.toString()
      })

      if (search && search.trim()) {
        params.append('search', search.trim())
      }

      const response = await apiRequest(`${endpoint}?${params.toString()}`)
      const data: ApiResponse<unknown[]> = await response.json()

      // 更新分页信息
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          [type]: {
            currentPage: data.pagination!.page || data.pagination!.currentPage,
            pageSize: data.pagination!.limit || data.pagination!.pageSize,
            total: data.pagination!.total,
            totalPages: data.pagination!.totalPages,
            hasNext: data.pagination!.hasNext,
            hasPrev: data.pagination!.hasPrev
          }
        }))
      }

      // 更新对应的数据状态
      const dataArray = data.data && Array.isArray(data.data) ? data.data : []
      switch (type) {
        case 'users':
          setUsers(dataArray)
          break
        case 'publications':
          setPublications(dataArray)
          break
        case 'tools':
          setTools(dataArray)
          break
        case 'news':
          setNews(dataArray)
          break
        case 'awards':
          setAwards(dataArray)
          break
        case 'articles':
          setArticles(dataArray)
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
        case 'articles':
          setArticles([])
          break
      }
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  // 删除操作
  const deleteItem = useCallback(async (id: number, type: AdminTabType) => {
    if (!confirm('确定要删除这条记录吗？')) return false

    try {
      const response = await apiRequest(`/api/${type}/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData(type)
        return true
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      return false
    }
  }, [apiRequest, fetchData])

  // 创建或更新操作
  const saveItem = useCallback(async (
    data: FormSubmitData,
    type: AdminTabType,
    isEdit: boolean = false,
    itemId?: number
  ) => {
    try {
      let url = ''
      const method = isEdit ? 'PUT' : 'POST'

      if (type === 'team') {
        // 根据成员类型确定API端点
        switch ((data as TeamMember).type) {
          case 'pi':
            url = isEdit ? `/api/team/pi/${itemId}` : '/api/team/pi'
            break
          case 'researcher':
            url = isEdit ? `/api/team/researchers/${itemId}` : '/api/team/researchers'
            break
          case 'graduate':
            url = isEdit ? `/api/team/graduates/${itemId}` : '/api/team/graduates'
            break
        }
      } else {
        url = isEdit ? `/api/${type}/${itemId}` : `/api/${type}`
      }

      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchData(type)
        return true
      } else {
        throw new Error(`${isEdit ? '更新' : '创建'}失败`)
      }
    } catch (error) {
      console.error(`${isEdit ? '更新' : '创建'}失败:`, error)
      return false
    }
  }, [apiRequest, fetchData])

  // 为每个数据类型创建具体的函数
  const fetchUsers = useCallback((page?: number, pageSize?: number, search?: string) => 
    fetchData('users', page, pageSize, search), [fetchData])
  const fetchPublications = useCallback((page?: number, pageSize?: number, search?: string) => 
    fetchData('publications', page, pageSize, search), [fetchData])
  const fetchTools = useCallback((page?: number, pageSize?: number, search?: string) => 
    fetchData('tools', page, pageSize, search), [fetchData])
  const fetchNews = useCallback((page?: number, pageSize?: number, search?: string) => 
    fetchData('news', page, pageSize, search), [fetchData])
  const fetchTeamMembers = useCallback((page?: number, pageSize?: number, search?: string) => 
    fetchData('team', page, pageSize, search), [fetchData])
  const fetchAwards = useCallback((page?: number, pageSize?: number, search?: string) => 
    fetchData('awards', page, pageSize, search), [fetchData])
  const fetchArticles = useCallback((page?: number, pageSize?: number, search?: string) => 
    fetchData('articles', page, pageSize, search), [fetchData])

  const deleteUser = useCallback((id: number) => deleteItem(id, 'users'), [deleteItem])
  const deletePublication = useCallback((id: number) => deleteItem(id, 'publications'), [deleteItem])
  const deleteTool = useCallback((id: number) => deleteItem(id, 'tools'), [deleteItem])
  const deleteNews = useCallback((id: number) => deleteItem(id, 'news'), [deleteItem])
  const deleteTeamMember = useCallback((id: number) => deleteItem(id, 'team'), [deleteItem])
  const deleteAward = useCallback((id: number) => deleteItem(id, 'awards'), [deleteItem])
  const deleteArticle = useCallback((id: number) => deleteItem(id, 'articles'), [deleteItem])

  const createUser = useCallback((data: FormSubmitData) => saveItem(data, 'users', false), [saveItem])
  const updateUser = useCallback((data: FormSubmitData, id: number) => saveItem(data, 'users', true, id), [saveItem])
  const createPublication = useCallback((data: FormSubmitData) => saveItem(data, 'publications', false), [saveItem])
  const updatePublication = useCallback((data: FormSubmitData, id: number) => saveItem(data, 'publications', true, id), [saveItem])
  const createTool = useCallback((data: FormSubmitData) => saveItem(data, 'tools', false), [saveItem])
  const updateTool = useCallback((data: FormSubmitData, id: number) => saveItem(data, 'tools', true, id), [saveItem])
  const createNews = useCallback((data: FormSubmitData) => saveItem(data, 'news', false), [saveItem])
  const updateNews = useCallback((data: FormSubmitData, id: number) => saveItem(data, 'news', true, id), [saveItem])
  const createTeamMember = useCallback((data: FormSubmitData) => saveItem(data, 'team', false), [saveItem])
  const updateTeamMember = useCallback((data: FormSubmitData, id: number) => saveItem(data, 'team', true, id), [saveItem])
  const createAward = useCallback((data: FormSubmitData) => saveItem(data, 'awards', false), [saveItem])
  const updateAward = useCallback((data: FormSubmitData, id: number) => saveItem(data, 'awards', true, id), [saveItem])
  const createArticle = useCallback((data: FormSubmitData) => saveItem(data, 'articles', false), [saveItem])
  const updateArticle = useCallback((data: FormSubmitData, id: number) => saveItem(data, 'articles', true, id), [saveItem])

  // 导出和导入函数（暂时返回 Promise<void>，实际实现可以后续添加）
  const exportUsers = useCallback(async () => {
    console.log('Export users functionality not implemented yet')
  }, [])
  const importUsers = useCallback(async (file: File) => {
    console.log('Import users functionality not implemented yet', file)
  }, [])
  const exportPublications = useCallback(async () => {
    console.log('Export publications functionality not implemented yet')
  }, [])
  const importPublications = useCallback(async (file: File) => {
    console.log('Import publications functionality not implemented yet', file)
  }, [])
  const exportTools = useCallback(async () => {
    console.log('Export tools functionality not implemented yet')
  }, [])
  const importTools = useCallback(async (file: File) => {
    console.log('Import tools functionality not implemented yet', file)
  }, [])
  const exportNews = useCallback(async () => {
    console.log('Export news functionality not implemented yet')
  }, [])
  const importNews = useCallback(async (file: File) => {
    console.log('Import news functionality not implemented yet', file)
  }, [])
  const exportTeamMembers = useCallback(async () => {
    console.log('Export team members functionality not implemented yet')
  }, [])
  const importTeamMembers = useCallback(async (file: File) => {
    console.log('Import team members functionality not implemented yet', file)
  }, [])
  const exportAwards = useCallback(async () => {
    console.log('Export awards functionality not implemented yet')
  }, [])
  const importAwards = useCallback(async (file: File) => {
    console.log('Import awards functionality not implemented yet', file)
  }, [])
  const exportArticles = useCallback(async () => {
    console.log('Export articles functionality not implemented yet')
  }, [])
  const importArticles = useCallback(async (file: File) => {
    console.log('Import articles functionality not implemented yet', file)
  }, [])

  return {
    // 数据状态
    users,
    publications,
    tools,
    news,
    teamMembers,
    awards,
    articles,
    
    // 分页状态
    pagination,
    
    // 加载状态
    loading,
    
    // 搜索状态
    searchTerm,
    setSearchTerm,
    
    // 通用操作方法
    fetchData,
    deleteItem,
    saveItem,
    apiRequest,
    
    // 用户相关函数
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    exportUsers,
    importUsers,
    
    // 出版物相关函数
    fetchPublications,
    createPublication,
    updatePublication,
    deletePublication,
    exportPublications,
    importPublications,
    
    // 工具相关函数
    fetchTools,
    createTool,
    updateTool,
    deleteTool,
    exportTools,
    importTools,
    
    // 新闻相关函数
    fetchNews,
    createNews,
    updateNews,
    deleteNews,
    exportNews,
    importNews,
    
    // 团队成员相关函数
    fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    exportTeamMembers,
    importTeamMembers,
    
    // 奖项相关函数
    fetchAwards,
    createAward,
    updateAward,
    deleteAward,
    exportAwards,
    importAwards,
    
    // 文章相关函数
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    exportArticles,
    importArticles
  }
}