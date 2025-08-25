import React, { useEffect } from 'react'
import { Form } from 'antd'
import { Newspaper, FileText, Image as ImageIcon } from 'lucide-react'
import UnifiedForm from '@/components/common/UnifiedForm'
import UnifiedFormField from '@/components/common/UnifiedFormField'
import ImageUploadWithAI from '../common/ImageUploadWithAI'
import RichTextEditor from '@/components/RichTextEditor'
import { News } from '../../../types/admin'

interface NewsFormProps {
  news?: News
  onSubmit: (data: Partial<News>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const NewsForm: React.FC<NewsFormProps> = ({ news, onSubmit, onCancel, loading = false }) => {
  const [form] = Form.useForm()
  const isEditing = !!news

  useEffect(() => {
    if (news) {
      form.setFieldsValue({
        title: news.title,
        summary: news.summary,
        content: news.content,
        image: news.image,
        isPinned: news.isPinned
      })
    }
  }, [news, form])

  const handleSubmit = async (values: Record<string, unknown>) => {
    await onSubmit(values)
  }

  return (
    <UnifiedForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitText={isEditing ? '更新新闻' : '添加新闻'}
      loading={loading}
      showValidationStatus={true}
      showSuccessMessage={true}
      successMessage={isEditing ? '新闻更新成功！' : '新闻创建成功！'}
      resetOnSuccess={!isEditing}
      layoutType="vertical"
      containerType="card"
      buttonAlign="center"
    >
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Newspaper className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
        {/* 新闻标题 */}
        <UnifiedFormField
          name="title"
          label="新闻标题"
          type="input"
          placeholder="请输入新闻标题"
          validationType="news"
        />

        {/* 新闻摘要 */}
        <UnifiedFormField
          name="summary"
          label="新闻摘要"
          type="textarea"
          placeholder="请输入新闻摘要（可选）"
          validationType="news"
        />

        {/* 新闻内容 */}
        <Form.Item
          label="新闻内容"
          name="content"
          rules={[{ required: true, message: '请输入新闻内容' }]}
        >
          <Form.Item noStyle shouldUpdate>
            {() => (
              <RichTextEditor
                value={form.getFieldValue('content') || ''}
                onChange={(value: string) => form.setFieldsValue({ content: value })}
                placeholder="请输入新闻详细内容"
              />
            )}
          </Form.Item>
        </Form.Item>

        {/* 图片 */}
        <Form.Item
          label={
            <span className="flex items-center space-x-1">
              <ImageIcon className="h-4 w-4" />
              图片
            </span>
          }
          name="image"
        >
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.summary !== currentValues.summary}>
            {() => (
              <ImageUploadWithAI
                value={form.getFieldValue('image')}
                onChange={(url: string) => form.setFieldsValue({ image: url })}
                summary={form.getFieldValue('summary') || ''}
                placeholder="上传图片或使用AI生成"
              />
            )}
          </Form.Item>
        </Form.Item>

        {/* 是否置顶 */}
        <UnifiedFormField
          name="isPinned"
          type="checkbox"
          label="置顶新闻"
          validationType="news"
        />
      </div>
    </UnifiedForm>
  )
}

export default NewsForm