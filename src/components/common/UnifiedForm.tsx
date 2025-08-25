import React, { useState, useCallback } from 'react'
import { Form, Button, Space, Spin, Alert, App } from 'antd'
import type { FormProps, FormInstance } from 'antd'
import { formStyles } from '@/utils/formStyles'
import { LoadingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

interface UnifiedFormProps extends Omit<FormProps, 'onFinish'> {
  // 表单提交处理函数
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void
  
  // 表单重置处理函数
  onReset?: () => void
  
  // 表单取消处理函数
  onCancel?: () => void
  
  // 提交按钮文本
  submitText?: string
  
  // 重置按钮文本
  resetText?: string
  
  // 取消按钮文本
  cancelText?: string
  
  // 是否显示重置按钮
  showReset?: boolean
  
  // 是否显示取消按钮
  showCancel?: boolean
  
  // 是否禁用提交按钮
  submitDisabled?: boolean
  
  // 表单布局类型
  layoutType?: 'standard' | 'vertical' | 'inline' | 'compact' | 'spacious'
  
  // 表单容器样式类型
  containerType?: 'standard' | 'card' | 'minimal' | 'modal'
  
  // 按钮对齐方式
  buttonAlign?: 'left' | 'center' | 'right'
  
  // 是否显示加载状态
  loading?: boolean
  
  // 自定义加载文本
  loadingText?: string
  
  // 表单实例引用
  formRef?: React.RefObject<FormInstance>
  
  // 子组件
  children: React.ReactNode
  
  // 自定义按钮区域
  customActions?: React.ReactNode
  
  // 是否自动滚动到错误字段
  scrollToFirstError?: boolean
  
  // 表单验证失败时的回调
  onValidationFailed?: (errorInfo: any) => void
  
  // 是否显示实时验证状态
  showValidationStatus?: boolean
  
  // 是否显示成功提示
  showSuccessMessage?: boolean
  
  // 自定义成功消息
  successMessage?: string
  
  // 是否在提交成功后重置表单
  resetOnSuccess?: boolean
}

const UnifiedForm: React.FC<UnifiedFormProps> = ({
  onSubmit,
  onReset,
  onCancel,
  submitText = '提交',
  resetText = '重置',
  cancelText = '取消',
  showReset = true,
  showCancel = false,
  submitDisabled = false,
  layoutType = 'standard',
  containerType = 'standard',
  buttonAlign = 'left',
  loading = false,
  loadingText = '处理中...',
  formRef,
  children,
  customActions,
  scrollToFirstError = true,
  onValidationFailed,
  showValidationStatus = true,
  showSuccessMessage = true,
  successMessage = '操作成功',
  resetOnSuccess = false,
  ...formProps
}) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  // 使用传入的 formRef 或默认的 form 实例
  const formInstance = formRef?.current || form
  
  // 监听表单字段变化
  const handleFieldsChange = useCallback(() => {
    setSubmitSuccess(false)
    setValidationErrors([])
  }, [])
  
  // 监听表单值变化，用于实时验证
  const handleValuesChange = useCallback((changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
    setSubmitSuccess(false)
    
    // 如果有自定义的 onValuesChange，调用它
    formProps.onValuesChange?.(changedValues, allValues)
  }, [formProps])
  
  // 处理表单提交
  const handleSubmit = useCallback(async (values: Record<string, unknown>) => {
    if (isSubmitting || loading) return
    
    try {
      setIsSubmitting(true)
      setValidationErrors([])
      setSubmitSuccess(false)
      
      await onSubmit(values)
      
      setSubmitSuccess(true)
      if (showSuccessMessage) {
        message.success(successMessage)
      }
      
      if (resetOnSuccess) {
        formInstance.resetFields()
      }
    } catch (error) {
      console.error('表单提交失败:', error)
      const errorMessage = error instanceof Error ? error.message : '操作失败，请重试'
      message.error(errorMessage)
      setValidationErrors([errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, isSubmitting, loading, showSuccessMessage, successMessage, resetOnSuccess, formInstance])
  
  // 处理表单重置
  const handleReset = useCallback(async () => {
    if (isResetting) return
    
    try {
      setIsResetting(true)
      formInstance.resetFields()
      setValidationErrors([])
      setSubmitSuccess(false)
      onReset?.()
      message.success('表单已重置')
    } catch (error) {
      console.error('表单重置失败:', error)
      message.error('重置失败，请重试')
    } finally {
      setIsResetting(false)
    }
  }, [formInstance, onReset, isResetting])
  
  // 处理表单验证失败
  const handleFinishFailed = useCallback((errorInfo: any) => {
    console.warn('表单验证失败:', errorInfo)
    const errors = errorInfo.errorFields.flatMap((field: any) => field.errors)
    setValidationErrors(errors)
    setSubmitSuccess(false)
    
    if (showValidationStatus && errors.length > 0) {
      message.error(`请检查表单中的 ${errors.length} 个错误`)
    } else {
      message.error('请检查表单中的错误信息')
    }
    
    onValidationFailed?.(errorInfo)
  }, [onValidationFailed, showValidationStatus])
  
  // 获取表单布局配置
  const layoutConfig = formStyles.layout[layoutType]
  
  // 获取容器样式
  const containerStyle = formStyles.container[containerType]
  
  // 获取按钮对齐样式
  const buttonJustify = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[buttonAlign]
  
  // 渲染加载状态
  if (loading) {
    return (
      <div style={{
        ...containerStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
      }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          size="large"
        />
        <div style={{
          marginTop: 16,
          color: formStyles.color.text.secondary,
          fontSize: 14,
        }}>
          {loadingText}
        </div>
      </div>
    )
  }
  
  return (
    <div style={containerStyle}>
      {/* 验证状态提示 */}
      {showValidationStatus && (
        <>
          {submitSuccess && (
            <Alert
              message="提交成功"
              description={successMessage}
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
              closable
              style={{ marginBottom: formStyles.spacing.formItem.medium }}
              onClose={() => setSubmitSuccess(false)}
            />
          )}
          
          {validationErrors.length > 0 && (
            <Alert
              message="表单验证失败"
              description={
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              type="error"
              icon={<ExclamationCircleOutlined />}
              showIcon
              closable
              style={{ marginBottom: formStyles.spacing.formItem.medium }}
              onClose={() => setValidationErrors([])}
            />
          )}
        </>
      )}
      
      <Form
        form={formRef ? undefined : form}
        {...formProps}
        {...layoutConfig}
        onFinish={handleSubmit}
        onFinishFailed={handleFinishFailed}
        onFieldsChange={handleFieldsChange}
        onValuesChange={handleValuesChange}
        scrollToFirstError={scrollToFirstError}
        validateTrigger={['onChange', 'onBlur']}
      >
        {children}
        
        {/* 按钮区域 */}
        <Form.Item
          style={{
            marginTop: formStyles.spacing.group.medium,
            marginBottom: 0,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: buttonJustify,
            gap: formStyles.spacing.button.medium,
            flexWrap: 'wrap',
          }}>
            {customActions || (
              <Space size={formStyles.spacing.button.medium}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={submitDisabled || isSubmitting || isResetting}
                  {...formStyles.button.primary}
                  style={{
                    ...formStyles.button.primary.style,
                    ...(submitSuccess ? { backgroundColor: formStyles.color.success } : {}),
                  }}
                >
                  {isSubmitting ? '提交中...' : submitSuccess ? '已提交' : submitText}
                </Button>
                
                {showReset && (
                  <Button
                    onClick={handleReset}
                    loading={isResetting}
                    disabled={isSubmitting || isResetting}
                    {...formStyles.button.secondary}
                  >
                    {isResetting ? '重置中...' : resetText}
                  </Button>
                )}
                
                {showCancel && (
                  <Button
                    onClick={onCancel}
                    disabled={isSubmitting || isResetting}
                    {...formStyles.button.secondary}
                  >
                    {cancelText}
                  </Button>
                )}
              </Space>
            )}
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default UnifiedForm