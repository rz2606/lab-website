import React, { useState, useEffect } from 'react'
import type { Award } from '@/types/admin'
import UnifiedForm from '../../common/UnifiedForm'
import UnifiedFormField from '../../common/UnifiedFormField'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Award as AwardIcon, Calendar, Users, FileText } from 'lucide-react'

interface AwardFormProps {
  award?: Award | null
  onSubmit: (data: Partial<Award>) => Promise<void>
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
    serialNumber: '',
    awardee: '',
    awardDate: '',
    awardName: '',
    advisor: '',
    remarks: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!award

  // 处理输入变化
  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 初始化表单数据
  useEffect(() => {
    if (award) {
      setFormData({
        serialNumber: award.serialNumber || '',
        awardee: award.awardee || '',
        awardDate: award.awardDate ? new Date(award.awardDate).toISOString().split('T')[0] : '',
        awardName: award.awardName || '',
        advisor: award.advisor || '',
        remarks: award.remarks || ''
      })
    } else {
      setFormData({
        serialNumber: '',
        awardee: '',
        awardDate: '',
        awardName: '',
        advisor: '',
        remarks: ''
      })
    }
  }, [award])

  // 处理表单提交
  const handleSubmit = async (values: Record<string, unknown>) => {
    const submitData: Partial<Award> = {
      serialNumber: values.serialNumber?.toString().trim() || undefined,
      awardee: values.awardee?.toString().trim(),
      awardDate: values.awardDate?.toString() || undefined,
      awardName: values.awardName?.toString().trim(),
      advisor: values.advisor?.toString().trim() || undefined,
      remarks: values.remarks?.toString().trim() || undefined
    }

    await onSubmit(submitData)
  }

  // 表单验证规则
  const validationRules = {
    awardee: {
      required: true,
      message: '请输入获奖人员'
    },
    awardName: {
      required: true,
      message: '请输入获奖名称'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">加载中...</span>
      </div>
    )
  }

  return (
    <div className="award-form">
      <UnifiedForm
        initialValues={formData}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      >
        {/* 基本信息 */}
        <div className="form-group">
          <h3 className="form-group-title">
            <AwardIcon className="h-5 w-5 mr-2 text-yellow-600" />
            基本信息
          </h3>
          
          <div className="form-grid">
            {/* 序号 */}
            <UnifiedFormField
              name="serialNumber"
              label="序号"
              type="input"
              placeholder="请输入序号"
              disabled={loading || isSubmitting}
            />

            {/* 获奖人员 */}
            <UnifiedFormField
              name="awardee"
              label="获奖人员"
              type="input"
              placeholder="请输入获奖人员，多人用顿号分隔"
              required
              disabled={loading || isSubmitting}
            />

            {/* 获奖时间 */}
            <UnifiedFormField
              name="awardDate"
              label="获奖时间"
              type="input"
              placeholder="请输入获奖时间"
              disabled={loading || isSubmitting}
            />
          </div>

          {/* 获奖名称 */}
          <UnifiedFormField
            name="awardName"
            label="获奖名称及等级"
            type="input"
            placeholder="请输入获奖名称及等级"
            required
            disabled={loading || isSubmitting}
          />

          {/* 指导老师 */}
          <UnifiedFormField
            name="advisor"
            label="指导老师"
            type="input"
            placeholder="请输入指导老师"
            disabled={loading || isSubmitting}
          />

          {/* 备注 */}
          <UnifiedFormField
            name="remarks"
            label="备注"
            type="textarea"
            placeholder="请输入备注信息"
            disabled={loading || isSubmitting}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-enhanced btn-secondary"
            disabled={loading || isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-enhanced btn-primary flex items-center"
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) && (
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