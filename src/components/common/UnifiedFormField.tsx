import React from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Switch,
  Radio,
  Checkbox,
  InputNumber,
  Rate,
  Slider,
  TimePicker,
  TreeSelect,
  Cascader,
  AutoComplete,
  Mentions,
  Button,
} from 'antd'
import type { FormInstance } from 'antd'
import type { FormItemProps, Rule } from 'antd/es/form'
import { formStyles } from '@/utils/formStyles'
import { validationRules } from '@/utils/formValidation'
import { UploadOutlined, PlusOutlined } from '@ant-design/icons'

const { TextArea, Password, Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { Group: RadioGroup } = Radio
const { Group: CheckboxGroup } = Checkbox
const { Dragger } = Upload

// 字段类型定义
export type FieldType =
  | 'input'
  | 'textarea'
  | 'password'
  | 'search'
  | 'number'
  | 'select'
  | 'multiSelect'
  | 'tags'
  | 'date'
  | 'dateRange'
  | 'datetime'
  | 'time'
  | 'upload'
  | 'imageUpload'
  | 'draggerUpload'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'checkboxGroup'
  | 'rate'
  | 'slider'
  | 'treeSelect'
  | 'cascader'
  | 'autoComplete'
  | 'mentions'
  | 'custom'

// 选项类型定义
export interface OptionType {
  label: string
  value: string | number | boolean
  disabled?: boolean
  children?: OptionType[]
}

// 字段配置接口
export interface UnifiedFormFieldProps extends Omit<FormItemProps, 'children'> {
  // 字段类型
  type: FieldType
  
  // 字段名称
  name: string
  
  // 字段标签
  label?: string
  
  // 占位符
  placeholder?: string
  
  // 是否必填
  required?: boolean
  
  // 自定义验证规则
  rules?: Rule[]
  
  // 预设验证规则类型
  validationType?: keyof typeof validationRules
  
  // 选项数据（用于 select、radio、checkbox 等）
  options?: OptionType[]
  
  // 是否禁用
  disabled?: boolean
  
  // 字段样式类型
  styleType?: 'standard' | 'compact' | 'spacious'
  
  // 自定义属性
  fieldProps?: Record<string, unknown>
  
  // 自定义渲染函数
  customRender?: (props: Record<string, unknown>) => React.ReactNode
  
  // 提示信息
  tooltip?: string
  
  // 额外信息
  extra?: React.ReactNode
  
  // 依赖字段（用于动态显示/隐藏）
  dependencies?: string[]
  
  // 显示条件函数
  shouldShow?: (form: FormInstance) => boolean
  
  // 字段变化回调
  onChange?: (value: string | number | boolean | Date | null, form: FormInstance | null) => void
}

const UnifiedFormField: React.FC<UnifiedFormFieldProps> = ({
  type,
  name,
  label,
  placeholder,
  required = false,
  rules = [],
  validationType,
  options = [],
  disabled = false,
  styleType = 'standard',
  fieldProps = {},
  customRender,
  tooltip,
  extra,
  dependencies = [],
  shouldShow,
  onChange,
  ...formItemProps
}) => {
  // 获取预设验证规则
  const getValidationRules = (): Rule[] => {
    let baseRules: Rule[] = []
    
    if (required) {
      baseRules.push(validationRules.common.required(`请输入${label || name}`))
    }
    
    if (validationType && validationRules[validationType as keyof typeof validationRules]) {
      const typeRules = (validationRules[validationType as keyof typeof validationRules] as any)[name]
      if (typeRules) {
        baseRules = [...baseRules, ...typeRules]
      }
    }
    
    return [...baseRules, ...rules]
  }
  
  // 获取字段样式
  const getFieldStyle = () => {
    return formStyles.item[styleType]
  }
  
  // 渲染不同类型的字段
  const renderField = () => {
    const baseProps = {
      placeholder: placeholder || `请输入${label || name}`,
      disabled,
      ...fieldProps,
    }
    
    switch (type) {
      case 'input':
        return (
          <Input 
            {...baseProps} 
            {...formStyles.input.standard}
            onChange={onChange ? (e) => onChange(e.target.value, null) : undefined}
          />
        )
      
      case 'textarea':
        return (
          <TextArea 
            {...baseProps} 
            {...formStyles.input.textarea}
            onChange={onChange ? (e) => onChange(e.target.value, null) : undefined}
          />
        )
      
      case 'password':
        return (
          <Password 
            {...baseProps} 
            {...formStyles.input.standard}
            onChange={onChange ? (e) => onChange(e.target.value, null) : undefined}
          />
        )
      
      case 'search':
        return (
          <Search 
            {...baseProps} 
            {...formStyles.input.search}
            onChange={onChange ? (e) => onChange(e.target.value, null) : undefined}
          />
        )
      
      case 'number':
        return (
          <InputNumber
            {...baseProps}
            style={{ width: '100%' }}
            {...formStyles.input.standard}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          />
        )
      
      case 'select':
        return (
          <Select 
            {...baseProps} 
            {...formStyles.select.standard}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          >
            {options.map((option) => (
              <Option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      
      case 'multiSelect':
        return (
          <Select 
            {...baseProps} 
            {...formStyles.select.multiple}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          >
            {options.map((option) => (
              <Option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      
      case 'tags':
        return (
          <Select 
            {...baseProps} 
            {...formStyles.select.tags}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          >
            {options.map((option) => (
              <Option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      
      case 'date':
        return (
          <DatePicker 
            {...baseProps} 
            {...formStyles.datePicker.standard}
            onChange={onChange ? (date) => onChange(date?.toDate() || null, null) : undefined}
          />
        )
      
      case 'dateRange':
        return (
          <RangePicker 
            {...baseProps} 
            {...formStyles.datePicker.range}
            onChange={onChange ? (dates) => onChange(dates, null) : undefined}
          />
        )
      
      case 'datetime':
        return (
          <DatePicker 
            {...baseProps} 
            {...formStyles.datePicker.datetime}
            onChange={onChange ? (date) => onChange(date?.toDate() || null, null) : undefined}
          />
        )
      
      case 'time':
        return (
          <TimePicker 
            {...baseProps} 
            style={{ width: '100%' }}
            onChange={onChange ? (time) => onChange(time?.toDate() || null, null) : undefined}
          />
        )
      
      case 'upload':
        return (
          <Upload 
            {...baseProps} 
            {...formStyles.upload.file}
            onChange={onChange ? (info) => onChange(info.fileList, null) : undefined}
          >
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
        )
      
      case 'imageUpload':
        return (
          <Upload 
            {...baseProps} 
            {...formStyles.upload.image}
            onChange={onChange ? (info) => onChange(info.fileList, null) : undefined}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传图片</div>
            </div>
          </Upload>
        )
      
      case 'draggerUpload':
        return (
          <Dragger 
            {...baseProps} 
            {...formStyles.upload.dragger}
            onChange={onChange ? (info) => onChange(info.fileList, null) : undefined}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">支持单个或批量上传</p>
          </Dragger>
        )
      
      case 'switch':
        return (
          <Switch 
            {...baseProps}
            onChange={onChange ? (checked) => onChange(checked, null) : undefined}
          />
        )
      
      case 'radio':
        return (
          <RadioGroup 
            {...baseProps}
            onChange={onChange ? (e) => onChange(e.target.value, null) : undefined}
          >
            {options.map((option) => (
              <Radio key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
        )
      
      case 'checkbox':
        return (
          <Checkbox 
            {...baseProps}
            onChange={onChange ? (e) => onChange(e.target.checked, null) : undefined}
          >
            {label}
          </Checkbox>
        )
      
      case 'checkboxGroup':
        return (
          <CheckboxGroup 
            {...baseProps}
            options={options.map(opt => ({ ...opt, value: String(opt.value) }))}
            onChange={onChange ? (checkedValues) => onChange(checkedValues, null) : undefined}
          />
        )
      
      case 'rate':
        return (
          <Rate 
            {...baseProps}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          />
        )
      
      case 'slider':
        return (
          <Slider 
            {...baseProps}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          />
        )
      
      case 'treeSelect':
        return (
          <TreeSelect
            {...baseProps}
            treeData={options.map(opt => ({ ...opt, value: String(opt.value) })) as any}
            style={{ width: '100%' }}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          />
        )
      
      case 'cascader':
        return (
          <Cascader
            {...baseProps}
            options={options.map(opt => ({ ...opt, value: String(opt.value) })) as any}
            style={{ width: '100%' }}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          />
        )
      
      case 'autoComplete':
        return (
          <AutoComplete
            {...baseProps}
            style={{ width: '100%' }}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
            options={options.map(opt => ({ ...opt, value: String(opt.value) }))}
          />
        )
      
      case 'mentions':
        return (
          <Mentions
            {...baseProps}
            options={options.map(opt => ({ ...opt, value: String(opt.value) }))}
            style={{ width: '100%' }}
            onChange={onChange ? (value) => onChange(value, null) : undefined}
          />
        )
      
      case 'custom':
        return customRender ? customRender(baseProps) : (
          <Input 
            {...baseProps}
            onChange={onChange ? (e) => onChange(e.target.value, null) : undefined}
          />
        )
      
      default:
        return (
          <Input 
            {...baseProps} 
            {...formStyles.input.standard}
            onChange={onChange ? (e) => onChange(e.target.value, null) : undefined}
          />
        )
    }
  }
  
  // 如果有显示条件且不满足，则不渲染
  if (shouldShow && !shouldShow(null)) {
    return null
  }
  
  return (
    <Form.Item
      name={name}
      label={label}
      rules={getValidationRules()}
      tooltip={tooltip}
      extra={extra}
      dependencies={dependencies}
      style={getFieldStyle()}
      {...formItemProps}
    >
      {renderField()}
    </Form.Item>
  )
}

export default UnifiedFormField