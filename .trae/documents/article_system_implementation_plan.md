# 文章系统实施计划

## 1. 项目概述

本文档详细说明了如何在现有实验室网站中实施新的文章管理系统，将科学期刊文章与新闻动态分离管理。

## 2. 实施阶段

### 阶段一：数据库设计与迁移 (1-2天)

**任务清单：**
- [ ] 更新 Prisma Schema，添加 Article 模型
- [ ] 创建数据库迁移文件
- [ ] 执行数据库迁移
- [ ] 验证数据库表结构
- [ ] 插入示例数据进行测试

**具体步骤：**
1. 在 `prisma/schema.prisma` 中添加 Article 模型定义
2. 更新 User 模型，添加文章相关的反向关联
3. 运行 `npx prisma db push` 或 `npx prisma migrate dev`
4. 运行 `npx prisma generate` 更新 Prisma Client
5. 创建种子数据文件 `prisma/seed-articles.ts`

### 阶段二：API 接口开发 (2-3天)

**任务清单：**
- [ ] 创建文章 API 路由文件
- [ ] 实现 CRUD 操作接口
- [ ] 添加搜索和筛选功能
- [ ] 实现批量导入功能
- [ ] 添加权限验证中间件
- [ ] 编写 API 测试用例

**文件结构：**
```
src/app/api/articles/
├── route.ts              # GET /api/articles, POST /api/articles
├── [id]/
│   └── route.ts          # GET, PUT, DELETE /api/articles/[id]
└── import/
    └── route.ts          # POST /api/articles/import
```

**核心功能实现：**
1. **基础 CRUD 操作**
   - 创建文章：验证必填字段，处理 DOI 唯一性
   - 读取文章：支持分页、搜索、筛选
   - 更新文章：部分更新支持
   - 删除文章：软删除或硬删除

2. **高级功能**
   - 全文搜索：基于标题、摘要、关键词
   - 多维度筛选：期刊、作者、年份、关键词
   - 批量导入：Excel/CSV 文件解析
   - 数据验证：DOI 格式验证、日期验证

### 阶段三：前端界面开发 (3-4天)

**任务清单：**
- [ ] 创建文章列表页面组件
- [ ] 创建文章详情页面组件
- [ ] 扩展管理后台，添加文章管理功能
- [ ] 实现搜索和筛选组件
- [ ] 添加文章编辑表单组件
- [ ] 实现批量导入界面
- [ ] 响应式设计适配

**组件结构：**
```
src/
├── app/
│   ├── articles/
│   │   ├── page.tsx              # 文章列表页面
│   │   └── [id]/
│   │       └── page.tsx          # 文章详情页面
│   └── admin/
│       └── page.tsx              # 扩展现有管理页面
├── components/
│   ├── ArticleCard.tsx           # 文章卡片组件
│   ├── ArticleDetail.tsx         # 文章详情组件
│   ├── ArticleForm.tsx           # 文章表单组件
│   ├── ArticleSearch.tsx         # 搜索筛选组件
│   ├── ArticleTable.tsx          # 管理表格组件
│   └── ArticleImport.tsx         # 批量导入组件
└── types/
    └── article.ts                # TypeScript 类型定义
```

### 阶段四：系统集成与测试 (1-2天)

**任务清单：**
- [ ] 集成文章系统到主导航
- [ ] 更新管理后台菜单
- [ ] 端到端功能测试
- [ ] 性能优化
- [ ] 用户体验测试
- [ ] 文档更新

## 3. 技术实施细节

### 3.1 数据库迁移脚本

```sql
-- 创建文章表的迁移脚本
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL COMMENT '文章标题',
    authors TEXT NOT NULL COMMENT '作者列表',
    journal VARCHAR(200) NOT NULL COMMENT '期刊名称',
    published_date DATE NOT NULL COMMENT '发表日期',
    doi VARCHAR(100) UNIQUE COMMENT 'DOI标识符',
    abstract TEXT COMMENT '摘要',
    keywords TEXT COMMENT '关键词，逗号分隔',
    full_text_url VARCHAR(500) COMMENT '全文链接',
    volume VARCHAR(50) COMMENT '卷号',
    issue VARCHAR(50) COMMENT '期号',
    pages VARCHAR(50) COMMENT '页码范围',
    impact_factor DECIMAL(5,3) COMMENT '影响因子',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT COMMENT '创建人',
    updated_by INT COMMENT '修改人',
    
    INDEX idx_articles_journal (journal),
    INDEX idx_articles_published_date (published_date DESC),
    INDEX idx_articles_authors (authors(100)),
    INDEX idx_articles_keywords (keywords(200)),
    INDEX idx_articles_created_at (created_at DESC),
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
) COMMENT='科学期刊文章表';

-- 创建全文搜索索引
ALTER TABLE articles ADD FULLTEXT(title, abstract, keywords);
```

### 3.2 TypeScript 类型定义

```typescript
// src/types/article.ts
export interface Article {
  id: number
  title: string
  authors: string
  journal: string
  publishedDate: string
  doi?: string
  abstract?: string
  keywords?: string
  fullTextUrl?: string
  volume?: string
  issue?: string
  pages?: string
  impactFactor?: number
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

export interface ArticleCreateInput {
  title: string
  authors: string
  journal: string
  publishedDate: string
  doi?: string
  abstract?: string
  keywords?: string
  fullTextUrl?: string
  volume?: string
  issue?: string
  pages?: string
  impactFactor?: number
}

export interface ArticleSearchParams {
  page?: number
  limit?: number
  search?: string
  journal?: string
  author?: string
  year?: number
  keywords?: string
}

export interface ArticleListResponse {
  data: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

### 3.3 管理后台集成方案

在现有的 `src/app/admin/page.tsx` 中添加文章管理功能：

1. **扩展 activeTab 状态**
   ```typescript
   const [activeTab, setActiveTab] = useState<string>('users')
   // 添加 'articles' 选项
   ```

2. **添加文章管理标签页**
   ```typescript
   const tabs = [
     { id: 'users', name: '用户管理', icon: Users },
     { id: 'publications', name: '发表成果', icon: BookOpen },
     { id: 'tools', name: '程序工具', icon: Code },
     { id: 'news', name: '新闻动态', icon: Newspaper },
     { id: 'articles', name: '期刊文章', icon: FileText }, // 新增
     { id: 'achievements', name: '成果管理', icon: Award },
     { id: 'team', name: '团队管理', icon: Users }
   ]
   ```

3. **实现文章管理组件**
   - 复用现有的表格组件样式
   - 添加文章特有的字段显示
   - 实现搜索和筛选功能
   - 集成批量导入功能

## 4. 数据迁移策略

### 4.1 现有数据分析

如果现有的 `news` 表中包含科学文章数据，需要进行数据迁移：

1. **识别科学文章**：通过标题、内容关键词识别
2. **数据清洗**：提取作者、期刊等信息
3. **格式转换**：将新闻格式转换为文章格式
4. **数据验证**：确保迁移数据的完整性

### 4.2 迁移脚本示例

```sql
-- 示例：从 news 表迁移科学文章数据
INSERT INTO articles (
    title, authors, journal, published_date, abstract, 
    keywords, created_at, updated_at, created_by
)
SELECT 
    title,
    '待补充' as authors,  -- 需要手动补充
    '待分类' as journal,  -- 需要手动分类
    DATE(created_at) as published_date,
    summary as abstract,
    '待标记' as keywords, -- 需要手动标记
    created_at,
    updated_at,
    created_by
FROM news 
WHERE title LIKE '%论文%' 
   OR title LIKE '%研究%' 
   OR title LIKE '%发表%'
   OR content LIKE '%期刊%';
```

## 5. 测试计划

### 5.1 单元测试
- API 接口功能测试
- 数据验证测试
- 权限控制测试

### 5.2 集成测试
- 前后端数据交互测试
- 搜索功能测试
- 批量导入测试

### 5.3 用户验收测试
- 管理员操作流程测试
- 访问者浏览体验测试
- 响应式设计测试

## 6. 部署计划

### 6.1 开发环境部署
1. 本地数据库迁移
2. 功能开发和测试
3. 代码审查

### 6.2 测试环境部署
1. 测试数据库迁移
2. 完整功能测试
3. 性能测试

### 6.3 生产环境部署
1. 数据库备份
2. 生产环境迁移
3. 功能验证
4. 监控和日志配置

## 7. 风险评估与应对

### 7.1 技术风险
- **数据库迁移失败**：提前备份，分步骤迁移
- **API 性能问题**：添加缓存，优化查询
- **前端兼容性问题**：充分测试，渐进式增强

### 7.2 业务风险
- **用户接受度**：提供培训，收集反馈
- **数据丢失**：多重备份，版本控制
- **功能冲突**：详细测试，回滚计划

## 8. 后续优化计划

### 8.1 功能增强
- 文章引用统计
- 相关文章推荐算法优化
- 高级搜索功能
- 文章标签系统

### 8.2 性能优化
- 数据库查询优化
- 前端缓存策略
- CDN 集成
- 图片懒加载

### 8.3 用户体验优化
- 搜索结果高亮
- 无限滚动加载
- 文章收藏功能
- 导出功能增强