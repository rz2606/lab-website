import type { Rule } from 'antd/es/form'

// 通用验证规则
export const commonValidationRules = {
  // 必填字段
  required: (message: string): Rule => ({
    required: true,
    message,
  }),

  // 邮箱验证
  email: (): Rule => ({
    type: 'email',
    message: '请输入有效的邮箱地址',
  }),

  // URL验证
  url: (): Rule => ({
    type: 'url',
    message: '请输入有效的URL地址',
  }),

  // 手机号验证
  phone: (): Rule => ({
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码',
  }),

  // 最小长度
  minLength: (min: number, message?: string): Rule => ({
    min,
    message: message || `最少输入${min}个字符`,
  }),

  // 最大长度
  maxLength: (max: number, message?: string): Rule => ({
    max,
    message: message || `最多输入${max}个字符`,
  }),

  // 数字范围
  numberRange: (min: number, max: number, message?: string): Rule => ({
    type: 'number',
    min,
    max,
    message: message || `请输入${min}-${max}之间的数字`,
  }),

  // 正整数
  positiveInteger: (): Rule => ({
    pattern: /^[1-9]\d*$/,
    message: '请输入正整数',
  }),

  // 非负整数
  nonNegativeInteger: (): Rule => ({
    pattern: /^(0|[1-9]\d*)$/,
    message: '请输入非负整数',
  }),

  // 自定义验证
  custom: (validator: (rule: Rule, value: string) => Promise<void>, message?: string): Rule => ({
    validator,
    message,
  }),
}

// 新闻表单验证规则
export const newsValidationRules = {
  title: [
    commonValidationRules.required('请输入新闻标题'),
    commonValidationRules.minLength(2, '标题至少2个字符'),
    commonValidationRules.maxLength(100, '标题最多100个字符'),
  ],
  content: [
    commonValidationRules.required('请输入新闻内容'),
    commonValidationRules.minLength(10, '内容至少10个字符'),
  ],
  summary: [
    commonValidationRules.maxLength(200, '摘要最多200个字符'),
  ],
  author: [
    commonValidationRules.required('请输入作者'),
    commonValidationRules.maxLength(50, '作者名称最多50个字符'),
  ],
  featuredImage: [
    commonValidationRules.url(),
  ],
  externalUrl: [
    commonValidationRules.url(),
  ],
  viewCount: [
    commonValidationRules.nonNegativeInteger(),
  ],
  location: [
    commonValidationRules.maxLength(100, '地点最多100个字符'),
  ],
  contactInfo: [
    commonValidationRules.maxLength(200, '联系信息最多200个字符'),
  ],
}

// 文章表单验证规则
export const articleValidationRules = {
  title: [
    commonValidationRules.required('请输入文章标题'),
    commonValidationRules.minLength(2, '标题至少2个字符'),
    commonValidationRules.maxLength(100, '标题最多100个字符'),
  ],
  content: [
    commonValidationRules.required('请输入文章内容'),
    commonValidationRules.minLength(10, '内容至少10个字符'),
  ],
  summary: [
    commonValidationRules.maxLength(300, '摘要最多300个字符'),
  ],
  author: [
    commonValidationRules.required('请输入作者'),
    commonValidationRules.maxLength(50, '作者名称最多50个字符'),
  ],
  featuredImage: [
    commonValidationRules.url(),
  ],
  externalUrl: [
    commonValidationRules.url(),
  ],
  viewCount: [
    commonValidationRules.nonNegativeInteger(),
  ],
  readingTime: [
    commonValidationRules.positiveInteger(),
  ],
  seoTitle: [
    commonValidationRules.maxLength(60, 'SEO标题最多60个字符'),
  ],
  seoDescription: [
    commonValidationRules.maxLength(160, 'SEO描述最多160个字符'),
  ],
  seoKeywords: [
    commonValidationRules.maxLength(200, 'SEO关键词最多200个字符'),
  ],
}

// 发表论文表单验证规则
export const publicationValidationRules = {
  title: [
    commonValidationRules.required('请输入论文标题'),
    commonValidationRules.minLength(5, '标题至少5个字符'),
    commonValidationRules.maxLength(200, '标题最多200个字符'),
  ],
  abstract: [
    commonValidationRules.required('请输入摘要'),
    commonValidationRules.minLength(50, '摘要至少50个字符'),
  ],
  journal: [
    commonValidationRules.required('请输入期刊名称'),
    commonValidationRules.maxLength(100, '期刊名称最多100个字符'),
  ],
  year: [
    commonValidationRules.required('请选择发表年份'),
    commonValidationRules.numberRange(1900, new Date().getFullYear() + 5),
  ],
  volume: [
    commonValidationRules.maxLength(20, '卷号最多20个字符'),
  ],
  issue: [
    commonValidationRules.maxLength(20, '期号最多20个字符'),
  ],
  pages: [
    commonValidationRules.maxLength(20, '页码最多20个字符'),
  ],
  doi: [
    commonValidationRules.maxLength(100, 'DOI最多100个字符'),
  ],
  url: [
    commonValidationRules.url(),
  ],
  pdfUrl: [
    commonValidationRules.url(),
  ],
  citationCount: [
    commonValidationRules.nonNegativeInteger(),
  ],
}

// 团队成员表单验证规则
export const teamMemberValidationRules = {
  name: [
    commonValidationRules.required('请输入姓名'),
    commonValidationRules.minLength(2, '姓名至少2个字符'),
    commonValidationRules.maxLength(50, '姓名最多50个字符'),
  ],
  email: [
    commonValidationRules.required('请输入邮箱'),
    commonValidationRules.email(),
  ],
  phone: [
    commonValidationRules.phone(),
  ],
  avatarUrl: [
    commonValidationRules.url(),
  ],
  position: [
    commonValidationRules.required('请输入职位'),
    commonValidationRules.maxLength(50, '职位最多50个字符'),
  ],
  department: [
    commonValidationRules.required('请输入部门'),
    commonValidationRules.maxLength(50, '部门最多50个字符'),
  ],
  bio: [
    commonValidationRules.maxLength(500, '个人简介最多500个字符'),
  ],
  education: [
    commonValidationRules.maxLength(200, '教育背景最多200个字符'),
  ],
  website: [
    commonValidationRules.url(),
  ],
  github: [
    commonValidationRules.url(),
  ],
  linkedin: [
    commonValidationRules.url(),
  ],
  twitter: [
    commonValidationRules.url(),
  ],
}

// 奖项表单验证规则
export const awardValidationRules = {
  title: [
    commonValidationRules.required('请输入奖项名称'),
    commonValidationRules.minLength(2, '奖项名称至少2个字符'),
    commonValidationRules.maxLength(100, '奖项名称最多100个字符'),
  ],
  description: [
    commonValidationRules.required('请输入奖项描述'),
    commonValidationRules.minLength(10, '描述至少10个字符'),
  ],
  organization: [
    commonValidationRules.required('请输入颁发机构'),
    commonValidationRules.maxLength(100, '颁发机构最多100个字符'),
  ],
  year: [
    commonValidationRules.required('请选择获奖年份'),
    commonValidationRules.numberRange(1900, new Date().getFullYear() + 1),
  ],
  amount: [
    commonValidationRules.nonNegativeInteger(),
  ],
  certificateUrl: [
    commonValidationRules.url(),
  ],
  notes: [
    commonValidationRules.maxLength(500, '备注最多500个字符'),
  ],
}

// 工具表单验证规则
export const toolValidationRules = {
  name: [
    commonValidationRules.required('请输入工具名称'),
    commonValidationRules.minLength(2, '工具名称至少2个字符'),
    commonValidationRules.maxLength(50, '工具名称最多50个字符'),
  ],
  description: [
    commonValidationRules.required('请输入工具描述'),
    commonValidationRules.minLength(10, '描述至少10个字符'),
  ],
  version: [
    commonValidationRules.required('请输入版本号'),
    commonValidationRules.maxLength(20, '版本号最多20个字符'),
  ],
  url: [
    commonValidationRules.url(),
  ],
  repositoryUrl: [
    commonValidationRules.url(),
  ],
  documentationUrl: [
    commonValidationRules.url(),
  ],
  downloadUrl: [
    commonValidationRules.url(),
  ],
  downloadCount: [
    commonValidationRules.nonNegativeInteger(),
  ],
  starCount: [
    commonValidationRules.nonNegativeInteger(),
  ],
  forkCount: [
    commonValidationRules.nonNegativeInteger(),
  ],
}

// 用户表单验证规则
export const userValidationRules = {
  username: [
    commonValidationRules.required('请输入用户名'),
    commonValidationRules.minLength(3, '用户名至少3个字符'),
    commonValidationRules.maxLength(20, '用户名最多20个字符'),
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
    },
  ],
  email: [
    commonValidationRules.required('请输入邮箱'),
    commonValidationRules.email(),
  ],
  password: [
    commonValidationRules.required('请输入密码'),
    commonValidationRules.minLength(6, '密码至少6个字符'),
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
      message: '密码必须包含大小写字母和数字',
    },
  ],
  name: [
    commonValidationRules.required('请输入姓名'),
    commonValidationRules.minLength(2, '姓名至少2个字符'),
    commonValidationRules.maxLength(50, '姓名最多50个字符'),
  ],
  phone: [
    commonValidationRules.phone(),
  ],
  avatar: [
    commonValidationRules.url(),
  ],
}

// 导出所有验证规则
export const validationRules = {
  common: commonValidationRules,
  news: newsValidationRules,
  article: articleValidationRules,
  publication: publicationValidationRules,
  teamMember: teamMemberValidationRules,
  award: awardValidationRules,
  tool: toolValidationRules,
  user: userValidationRules,
}