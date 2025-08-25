// Admin 管理系统相关类型定义

export interface User {
  id: number
  username: string
  email: string
  roleType: string
  name?: string
  avatar?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export interface Publication {
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

export interface Tool {
  id: number
  name: string
  description: string
  category: string
  url?: string
  image?: string
  reference?: string
  tags: string
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
  // 扩展字段以匹配Prisma schema
  shortDescription?: string
  version?: string
  type?: string
  authors?: string[]
  maintainers?: string[]
  license?: string
  homepage?: string
  repository?: string
  documentation?: string
  downloadUrl?: string
  demoUrl?: string
  screenshots?: string[]
  features?: string[]
  requirements?: string
  installation?: string
  usage?: string
  changelog?: string
  status?: string
  visibility?: string
  featured?: boolean
  downloads?: number
  stars?: number
  forks?: number
  issues?: number
  releaseDate?: string
  lastUpdate?: string
  githubUrl?: string
  starCount?: number
  forkCount?: number
  issueCount?: number
}

export interface News {
  id: number
  title: string
  content: string
  summary?: string
  image?: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

// 统一的团队成员接口
export interface TeamMember {
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
  enrollmentDate?: string
  graduationDate?: string
  advisor?: string
  degree?: string
  discipline?: string
  thesisTitle?: string
  remarks?: string
}

// 获奖者接口（保持向后兼容）
export interface AwardWinner {
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

// 获奖接口（匹配数据库结构）
export interface Award {
  id: number
  serialNumber?: string
  awardee: string // 获奖人员
  awardDate?: string // 获奖时间
  awardName: string // 获奖名称及等级
  advisor?: string // 指导老师
  remarks?: string // 备注
  createdAt?: string
  updatedAt?: string
  createdBy?: number
  updatedBy?: number
  creator?: {
    id: number
    username: string
  }
  updater?: {
    id: number
    username: string
  }
  // 扩展字段（用于前端组件兼容）
  name?: string
  description?: string
  type?: string
  level?: string
  rank?: string
  organization?: string
  organizer?: string
  winners?: string[]
  winnerIds?: number[]
  certificateUrl?: string
  newsUrl?: string
  externalUrl?: string
  images?: string[]
  tags?: string[]
  category?: string
  prizeAmount?: number
  currency?: string
  criteria?: string
  significance?: string
  impact?: string
  relatedProjects?: string[]
  relatedPublications?: string[]
  status?: string
  visibility?: string
  featured?: boolean
  notes?: string
}

// 文章接口
export interface Article {
  id: number
  title: string
  authors: string
  journal: string
  publishedDate: string
  doi?: string
  abstract?: string
  keywords?: string
  impactFactor?: number
  category?: string
  citationCount?: number
  isOpenAccess?: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    id: number
    username: string
  }
  updatedBy?: {
    id: number
    username: string
  }
}

// 工作表信息接口
export interface WorksheetInfo {
  name: string
  data: unknown[][]
  previewData: unknown[][]
}

// Excel文件解析结果接口
export interface ExcelParseResult {
  worksheets: WorksheetInfo[]
  fileName: string
}

// 分页信息接口
export interface PaginationInfo {
  currentPage: number
  pageSize: number
  total: number
  totalPages: number
  hasNext?: boolean
  hasPrev?: boolean
}

// 分页状态管理接口
export interface PaginationState {
  users: PaginationInfo
  publications: PaginationInfo
  tools: PaginationInfo
  news: PaginationInfo
  awards: PaginationInfo
  articles: PaginationInfo
  team: PaginationInfo
}

// 模态框类型
export type ModalType = 'create' | 'edit'

// 团队成员类型
export type TeamMemberType = 'pi' | 'researcher' | 'graduate'

// 导入类型
export type ImportType = 'graduate' | 'award'

// 导入结果接口
export interface ImportResult {
  success: boolean
  message: string
  count?: number
}

// 管理员标签页类型
export type AdminTabType = 'users' | 'team' | 'publications' | 'tools' | 'news' | 'achievements' | 'awards' | 'articles'

// 成果子标签页类型
export type AchievementSubTabType = 'articles' | 'awards'

// API响应接口
export interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  message?: string
}

// 表单提交数据类型
export type FormSubmitData = 
  | User 
  | TeamMember 
  | Publication 
  | Tool 
  | News 
  | Article 
  | AwardWinner

// 表格操作类型
export type TableAction = 'view' | 'edit' | 'delete'

// 搜索过滤器接口
export interface SearchFilter {
  term: string
  type?: string
  category?: string
  dateRange?: {
    start: string
    end: string
  }
}