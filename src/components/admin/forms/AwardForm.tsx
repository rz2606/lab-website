import React, { useState, useEffect } from 'react'
import type 









{ Award as AwardType } from '@/types/admin'
import { UnifiedForm } from '../../common/UnifiedForm'
import { UnifiedFormField } from '../../common/UnifiedFormField'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  Award, 
  Calendar, 
  Building, 
  Users, 
  Star, 
  Link, 
  Trophy, 
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'

interface AwardFormProps {
  award?: AwardType | null
  onSubmit: (awardData: Partial<AwardType>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const AwardForm: React.FC<AwardFormProps> = ({
  award,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'academic' as 'academic' | 'research' | 'innovation' | 'service' | 'teaching' | 'competition' | 'honor',
    level: 'international' as 'international' | 'national' | 'provincial' | 'municipal' | 'institutional' | 'departmental',
    rank: 'first' as 'first' | 'second' | 'third' | 'excellence' | 'participation' | 'nomination',
    organization: '',
    organizer: '',
    awardDate: '',
    winners: [] as string[],
    winnerIds: [] as string[],
    certificateUrl: '',
    newsUrl: '',
    externalUrl: '',
    images: [] as string[],
    tags: [] as string[],
    category: '',
    prizeAmount: 0,
    currency: 'CNY' as 'CNY' | 'USD' | 'EUR',
    criteria: '',
    significance: '',
    impact: '',
    relatedProjects: [] as string[],
    relatedPublications: [] as string[],
    status: 'confirmed' as 'confirmed' | 'pending' | 'nominated' | 'declined',
    visibility: 'public' as 'public' | 'internal' | 'private',
    featured: false,
    notes: ''
  })
  
  const [winnerInput, setWinnerInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [projectInput, setProjectInput] = useState('')
  const [publicationInput, setPublicationInput] = useState('')

  // 初始化表单数据
  useEffect(() => {
    if (award) {
      setFormData({
        name: award.name || '',
        description: award.description || '',
        type: award.type || 'academic',
        level: award.level || 'international',
        rank: award.rank || 'first',
        organization: award.organization || '',
        organizer: award.organizer || '',
        awardDate: award.awardDate ? new Date(award.awardDate).toISOString().split('T')[0] : '',
        winners: award.winners || [],
        winnerIds: award.winnerIds || [],
        certificateUrl: award.certificateUrl || '',
        newsUrl: award.newsUrl || '',
        externalUrl: award.externalUrl || '',
        images: award.images || [],
        tags: award.tags || [],
        category: award.category || '',
        prizeAmount: award.prizeAmount || 0,
        currency: award.currency || 'CNY',
        criteria: award.criteria || '',
        significance: award.significance || '',
        impact: award.impact || '',
        relatedProjects: award.relatedProjects || [],
        relatedPublications: award.relatedPublications || [],
        status: award.status || 'confirmed',
        visibility: award.visibility || 'public',
        featured: award.featured || false,
        notes: award.notes || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'academic',
        level: 'international',
        rank: 'first',
        organization: '',
        organizer: '',
        awardDate: new Date().toISOString().split('T')[0],
        winners: [],
        winnerIds: [],
        certificateUrl: '',
        newsUrl: '',
        externalUrl: '',
        images: [],
        tags: [],
        category: '',
        prizeAmount: 0,
        currency: 'CNY',
        criteria: '',
        significance: '',
        impact: '',
        relatedProjects: [],
        relatedPublications: [],
        status: 'confirmed',
        visibility: 'public',
        featured: false,
        notes: ''
      })
    }
  }, [award])



  // URL验证函数
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 添加获奖者
  const addWinner = () => {
    if (winnerInput.trim() && !formData.winners.includes(winnerInput.trim())) {
      handleInputChange('winners', [...formData.winners, winnerInput.trim()])
      setWinnerInput('')
    }
  }

  // 删除获奖者
  const removeWinner = (index: number) => {
    const newWinners = formData.winners.filter((_, i) => i !== index)
    handleInputChange('winners', newWinners)
  }

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // 删除标签
  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index)
    handleInputChange('tags', newTags)
  }

  // 添加图片
  const addImage = () => {
    if (imageInput.trim() && isValidUrl(imageInput.trim()) && !formData.images.includes(imageInput.trim())) {
      handleInputChange('images', [...formData.images, imageInput.trim()])
      setImageInput('')
    }
  }

  // 删除图片
  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    handleInputChange('images', newImages)
  }

  // 添加相关项目
  const addProject = () => {
    if (projectInput.trim() && !formData.relatedProjects.includes(projectInput.trim())) {
      handleInputChange('relatedProjects', [...formData.relatedProjects, projectInput.trim()])
      setProjectInput('')
    }
  }

  // 删除相关项目
  const removeProject = (index: number) => {
    const newProjects = formData.relatedProjects.filter((_, i) => i !== index)
    handleInputChange('relatedProjects', newProjects)
  }

  // 添加相关发表
  const addPublication = () => {
    if (publicationInput.trim() && !formData.relatedPublications.includes(publicationInput.trim())) {
      handleInputChange('relatedPublications', [...formData.relatedPublications, publicationInput.trim()])
      setPublicationInput('')
    }
  }

  // 删除相关发表
  const removePublication = (index: number) => {
    const newPublications = formData.relatedPublications.filter((_, i) => i !== index)
    handleInputChange('relatedPublications', newPublications)
  }

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    const submitData: Partial<AwardType> = {
      name: values.name?.trim(),
      description: values.description?.trim(),
      type: values.type,
      level: values.level,
      rank: values.rank,
      organization: values.organization?.trim(),
      organizer: values.organizer?.trim() || undefined,
      awardDate: values.awardDate ? new Date(values.awardDate).toISOString() : undefined,
      winners: formData.winners,
      winnerIds: formData.winnerIds.length > 0 ? formData.winnerIds : undefined,
      certificateUrl: values.certificateUrl?.trim() || undefined,
      newsUrl: values.newsUrl?.trim() || undefined,
      externalUrl: values.externalUrl?.trim() || undefined,
      images: formData.images.length > 0 ? formData.images : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      category: values.category?.trim() || undefined,
      prizeAmount: values.prizeAmount > 0 ? values.prizeAmount : undefined,
      currency: values.prizeAmount > 0 ? values.currency : undefined,
      criteria: values.criteria?.trim() || undefined,
      significance: values.significance?.trim() || undefined,
      impact: values.impact?.trim() || undefined,
      relatedProjects: formData.relatedProjects.length > 0 ? formData.relatedProjects : undefined,
      relatedPublications: formData.relatedPublications.length > 0 ? formData.relatedPublications : undefined,
      status: values.status,
      visibility: values.visibility,
      featured: values.featured,
      notes: values.notes?.trim() || undefined
    }

    await onSubmit(submitData)
  }

  const isEditing = !!award

  return (
    <div className="relative">
      {/* 加载状态覆盖层 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
      
      <UnifiedForm
        onSubmit={handleSubmit}
        initialValues={formData}
        validationRules={{
          name: [
            { required: true, message: '奖项名称不能为空' },
            { minLength: 2, message: '奖项名称至少需要2个字符' },
            { maxLength: 200, message: '奖项名称不能超过200个字符' }
          ],
          description: [
            { required: true, message: '奖项描述不能为空' },
            { minLength: 10, message: '奖项描述至少需要10个字符' },
            { maxLength: 2000, message: '奖项描述不能超过2000个字符' }
          ],
          organization: [
            { required: true, message: '颁发机构不能为空' }
          ],
          awardDate: [
            { required: true, message: '获奖日期不能为空' },
            { 
              validator: (value: string) => {
                if (value && new Date(value) > new Date()) {
                  return '获奖日期不能晚于今天'
                }
                return null
              }
            }
          ],
          certificateUrl: [
            { 
              validator: (value: string) => {
                if (value && !isValidUrl(value)) {
                  return '请输入有效的URL地址'
                }
                return null
              }
            }
          ],
          newsUrl: [
            { 
              validator: (value: string) => {
                if (value && !isValidUrl(value)) {
                  return '请输入有效的URL地址'
                }
                return null
              }
            }
          ],
          externalUrl: [
            { 
              validator: (value: string) => {
                if (value && !isValidUrl(value)) {
                  return '请输入有效的URL地址'
                }
                return null
              }
            }
          ],
          prizeAmount: [
            { 
              validator: (value: number) => {
                if (value < 0) {
                  return '奖金金额不能为负数'
                }
                return null
              }
            }
          ]
        }}
        className="space-y-8"
      >
        {/* 基本信息 */}
        <div className="form-group">
          <h3 className="form-group-title">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            基本信息
          </h3>
          
          <div className="form-grid">
        
            {/* 奖项名称 */}
            <UnifiedFormField
              name="name"
              label="奖项名称"
              type="text"
              placeholder="请输入奖项名称"
              maxLength={200}
              required
              showCharCount
              disabled={loading}
            />

            {/* 类型、级别、排名 */}
            <UnifiedFormField
              name="type"
              label="奖项类型"
              type="select"
              options={[
                { value: 'academic', label: '学术奖项' },
                { value: 'research', label: '科研奖项' },
                { value: 'innovation', label: '创新奖项' },
                { value: 'service', label: '服务奖项' },
                { value: 'teaching', label: '教学奖项' },
                { value: 'competition', label: '竞赛奖项' },
                { value: 'honor', label: '荣誉奖项' }
              ]}
              disabled={loading || isSubmitting}
            />

            <UnifiedFormField
              name="level"
              label="奖项级别"
              type="select"
              options={[
                { value: 'international', label: '国际级' },
                { value: 'national', label: '国家级' },
                { value: 'provincial', label: '省级' },
                { value: 'municipal', label: '市级' },
                { value: 'institutional', label: '校级' },
                { value: 'departmental', label: '院级' }
              ]}
              disabled={loading || isSubmitting}
            />

            <UnifiedFormField
              name="rank"
              label="获奖等级"
              type="select"
              options={[
                { value: 'first', label: '一等奖' },
                { value: 'second', label: '二等奖' },
                { value: 'third', label: '三等奖' },
                { value: 'excellence', label: '优秀奖' },
                { value: 'participation', label: '参与奖' },
                { value: 'nomination', label: '提名奖' }
              ]}
              disabled={loading || isSubmitting}
            />
        </div>

        {/* 颁发机构和主办方 */}
        <div className="form-group">
          <h3 className="form-group-title">
            <Building className="h-5 w-5 mr-2 text-blue-600" />
            机构信息
          </h3>
          <div className="form-grid">
            <UnifiedFormField
              name="organization"
              label="颁发机构"
              type="text"
              placeholder="如：中国科学院、IEEE"
              required
              disabled={loading || isSubmitting}
            />

            <UnifiedFormField
              name="organizer"
              label="主办方"
              type="text"
              placeholder="主办方名称"
              disabled={loading || isSubmitting}
            />
          </div>
        </div>

            {/* 分类和获奖日期 */}
            <UnifiedFormField
              name="category"
              label="奖项分类"
              type="text"
              placeholder="如：自然科学奖、技术发明奖"
              disabled={loading || isSubmitting}
            />

            <UnifiedFormField
              name="awardDate"
              label="获奖日期"
              type="date"
              required
              disabled={loading || isSubmitting}
            />

            {/* 状态、可见性、特色标记 */}
            <UnifiedFormField
              name="status"
              label="状态"
              type="select"
              options={[
                { value: 'confirmed', label: '已确认' },
                { value: 'pending', label: '待确认' },
                { value: 'nominated', label: '已提名' },
                { value: 'declined', label: '已拒绝' }
              ]}
              disabled={loading || isSubmitting}
            />

            <UnifiedFormField
              name="visibility"
              label="可见性"
              type="select"
              options={[
                { value: 'public', label: '公开' },
                { value: 'internal', label: '内部' },
                { value: 'private', label: '私有' }
              ]}
              disabled={loading || isSubmitting}
            />

            <UnifiedFormField
              name="featured"
              label="设为特色奖项"
              type="checkbox"
              disabled={loading || isSubmitting}
            />
      </div>

      {/* 奖项描述 */}
      <div className="form-group">
        <h3 className="form-group-title">
          <FileText className="h-5 w-5 mr-2 text-green-600" />
          奖项描述
        </h3>
        
        <UnifiedFormField
          name="description"
          label="奖项描述"
          type="textarea"
          rows={4}
          placeholder="请详细描述奖项的背景、意义和获奖原因"
          maxLength={2000}
          required
          showCharCount
          disabled={loading || isSubmitting}
        />

        <div className="form-grid">
          {/* 评选标准 */}
          <UnifiedFormField
            name="criteria"
            label="评选标准"
            type="textarea"
            rows={3}
            placeholder="描述该奖项的评选标准和要求"
            disabled={loading || isSubmitting}
          />

          {/* 意义和影响 */}
          <UnifiedFormField
            name="significance"
            label="奖项意义"
            type="textarea"
            rows={3}
            placeholder="描述该奖项的重要性和意义"
            disabled={loading || isSubmitting}
          />

          <UnifiedFormField
            name="impact"
            label="影响和价值"
            type="textarea"
            rows={3}
            placeholder="描述获奖对个人或团队的影响和价值"
            disabled={loading || isSubmitting}
          />
        </div>
      </div>

      {/* 获奖者信息 */}
      <div className="form-group">
        <h3 className="form-group-title">
          <Users className="h-5 w-5 mr-2 text-purple-600" />
          获奖者信息
        </h3>
        
        <div>
          <label className="form-label-enhanced required">
            获奖者
          </label>
          <div className="flex space-x-2 mb-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={winnerInput}
                onChange={(e) => setWinnerInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWinner())}
                className="form-input-enhanced pl-10"
                placeholder="输入获奖者姓名并按回车添加"
                disabled={loading}
              />
            </div>
            <button
              type="button"
              onClick={addWinner}
              className="btn-enhanced btn-primary"
              disabled={loading || !winnerInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.winners.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.winners.map((winner, index) => (
                <span
                  key={index}
                  className="tag-item tag-purple"
                >
                  {winner}
                  <button
                    type="button"
                    onClick={() => removeWinner(index)}
                    className="tag-remove"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 奖金信息 */}
      <div className="form-group">
        <h3 className="form-group-title">
          <Star className="h-5 w-5 mr-2 text-yellow-600" />
          奖金信息
        </h3>
        
        <div className="form-grid">
          <UnifiedFormField
            name="prizeAmount"
            label="奖金金额"
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            disabled={loading || isSubmitting}
          />

          <UnifiedFormField
            name="currency"
            label="货币单位"
            type="select"
            options={[
              { value: 'CNY', label: '人民币 (CNY)' },
              { value: 'USD', label: '美元 (USD)' },
              { value: 'EUR', label: '欧元 (EUR)' }
            ]}
            disabled={loading || isSubmitting}
          />
        </div>
      </div>

      {/* 链接和媒体 */}
      <div className="form-group">
        <h3 className="form-group-title">
          <Link className="h-5 w-5 mr-2 text-blue-600" />
          链接和媒体
        </h3>
        
        {/* 证书链接 */}
        <UnifiedFormField
          name="certificateUrl"
          label="证书链接"
          type="url"
          placeholder="https://example.com/certificate.pdf"
          disabled={loading || isSubmitting}
        />

        {/* 新闻链接和外部链接 */}
        <div className="form-grid">
          <UnifiedFormField
            name="newsUrl"
            label="新闻链接"
            type="url"
            placeholder="https://example.com/news"
            disabled={loading || isSubmitting}
          />

          <UnifiedFormField
            name="externalUrl"
            label="外部链接"
            type="url"
            placeholder="https://example.com/award"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 图片 */}
        <div>
          <label className="form-label-enhanced">
            相关图片
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
              className="form-input-enhanced flex-1"
              placeholder="输入图片URL并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addImage}
              className="btn-enhanced btn-primary"
              disabled={loading || !imageInput.trim() || !isValidUrl(imageInput.trim())}
            >
              添加
            </button>
          </div>
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image}
                    alt={`图片 ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-16 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 标签和分类 */}
      <div className="form-group">
        <h3 className="form-group-title">
          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
          标签和分类
        </h3>
        
        <div>
          <label className="form-label-enhanced">
            标签
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="form-input-enhanced flex-1"
              placeholder="输入标签并按回车添加"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={addTag}
              className="btn-enhanced btn-primary"
              disabled={loading || !tagInput.trim()}
            >
              添加
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="tag-item tag-green"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="tag-remove"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 相关信息 */}
      <div className="form-group">
        <div className="form-group-title">
          <Link className="text-indigo-600" size={20} />
          <span>相关信息</span>
        </div>
        
        <div className="form-grid">
          {/* 相关项目 */}
          <div>
            <label className="form-label-enhanced">
              相关项目
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProject())}
                className="form-input-enhanced flex-1"
                placeholder="输入相关项目并按回车添加"
                disabled={loading || isSubmitting}
              />
              <button
                type="button"
                onClick={addProject}
                className="btn-enhanced btn-primary"
                disabled={loading || !projectInput.trim()}
              >
                添加
              </button>
            </div>
            {formData.relatedProjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.relatedProjects.map((project, index) => (
                  <span
                    key={index}
                    className="tag-item tag-purple"
                  >
                    {project}
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="tag-remove"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 相关发表 */}
          <div>
            <label className="form-label-enhanced">
              相关发表
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={publicationInput}
                onChange={(e) => setPublicationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPublication())}
                className="form-input-enhanced flex-1"
                placeholder="输入相关发表并按回车添加"
                disabled={loading || isSubmitting}
              />
              <button
                type="button"
                onClick={addPublication}
                className="btn-enhanced btn-primary"
                disabled={loading || !publicationInput.trim()}
              >
                添加
              </button>
            </div>
            {formData.relatedPublications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.relatedPublications.map((publication, index) => (
                  <span
                    key={index}
                    className="tag-item tag-orange"
                  >
                    {publication}
                    <button
                      type="button"
                      onClick={() => removePublication(index)}
                      className="tag-remove"
                      disabled={loading || isSubmitting}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 备注 */}
      <div className="form-group">
        <div className="form-group-title">
          <FileText className="text-gray-600" size={20} />
          <span>备注信息</span>
        </div>
        
        <UnifiedFormField
          name="notes"
          label="备注"
          type="textarea"
          rows={3}
          placeholder="其他需要说明的信息"
          disabled={loading || isSubmitting}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-enhanced btn-secondary"
          disabled={loading}
        >
          取消
        </button>
        <button
          type="submit"
          className="btn-enhanced btn-primary flex items-center"
          disabled={loading}
        >
          {loading && (
              <div className="loading-spinner mr-2" />
            )}
          {isEditing ? '更新获奖' : '添加获奖'}
        </button>
        </div>
      </UnifiedForm>
    </div>
  )
}

export default AwardForm