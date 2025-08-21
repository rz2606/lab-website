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
    
    if (validationType && validationRules[validationType]) {
      const typeRules = validationRules[validationType][name]
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
    const commonProps = {
      placeholder: placeholder || `请输入${label || name}`,
      disabled,
      onChange: onChange ? (value: string | number | boolean | Date | null) => {
          // 这里需要获取 form 实例，暂时传 null
          onChange(value, null)
        } : undefined,
      ...fieldProps,
    }
    
    switch (type) {
      case 'input':
        return <Input {...commonProps} {...formStyles.input.standard} />
      
      case 'textarea':
        return <TextArea {...commonProps} {...formStyles.input.textarea} />
      
      case 'password':
        return <Password {...commonProps} {...formStyles.input.standard} />
      
      case 'search':
        return <Search {...commonProps} {...formStyles.input.search} />
      
      case 'number':
        return (
          <InputNumber
            {...commonProps}
            style={{ width: '100%', ...formStyles.input.standard.style }}
            {...formStyles.input.standard}
          />
        )
      
      case 'select':
        return (
          <Select {...commonProps} {...formStyles.select.standard}>
            {options.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      
      case 'multiSelect':
        return (
          <Select {...commonProps} {...formStyles.select.multiple}>
            {options.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      
      case 'tags':
        return (
          <Select {...commonProps} {...formStyles.select.tags}>
            {options.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      
      case 'date':
        return <DatePicker {...commonProps} {...formStyles.datePicker.standard} />
      
      case 'dateRange':
        return <RangePicker {...commonProps} {...formStyles.datePicker.range} />
      
      case 'datetime':
        return <DatePicker {...commonProps} {...formStyles.datePicker.datetime} />
      
      case 'time':
        return <TimePicker {...commonProps} style={{ width: '100%' }} />
      
      case 'upload':
        return (
          <Upload {...commonProps} {...formStyles.upload.file}>
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
        )
      
      case 'imageUpload':
        return (
          <Upload {...commonProps} {...formStyles.upload.image}>
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传图片</div>
            </div>
          </Upload>
        )
      
      case 'draggerUpload':
        return (
          <Dragger {...commonProps} {...formStyles.upload.dragger}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">支持单个或批量上传</p>
          </Dragger>
        )
      
      case 'switch':
        return <Switch {...commonProps} />
      
      case 'radio':
        return (
          <RadioGroup {...commonProps}>
            {options.map((option) => (
              <Radio key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
        )
      
      case 'checkbox':
        return <Checkbox {...commonProps}>{label}</Checkbox>
      
      case 'checkboxGroup':
        return (
          <CheckboxGroup {...commonProps} options={options} />
        )
      
      case 'rate':
        return <Rate {...commonProps} />
      
      case 'slider':
        return <Slider {...commonProps} />
      
      case 'treeSelect':
        return (
          <TreeSelect
            {...commonProps}
            treeData={options}
            style={{ width: '100%' }}
          />
        )
      
      case 'cascader':
        return (
          <Cascader
            {...commonProps}
            options={options}
            style={{ width: '100%' }}
          />
        )
      
      case 'autoComplete':
        return (
          <AutoComplete
            {...commonProps}
            options={options}
            style={{ width: '100%' }}
          />
        )
      
      case 'mentions':
        return (
          <Mentions
            {...commonProps}
            options={options}
            style={{ width: '100%' }}
          />
        )
      
      case 'custom':
        return customRender ? customRender(commonProps) : null
      
      default:
        return <Input {...commonProps} {...formStyles.input.standard} />
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