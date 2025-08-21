// 表单样式配置

// 统一的表单布局配置
export const formLayout = {
  // 标准表单布局
  standard: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  
  // 垂直表单布局
  vertical: {
    layout: 'vertical' as const,
  },
  
  // 内联表单布局
  inline: {
    layout: 'inline' as const,
  },
  
  // 紧凑表单布局
  compact: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
    size: 'small' as const,
  },
  
  // 宽松表单布局
  spacious: {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    size: 'large' as const,
  },
}

// 统一的表单项样式
export const formItemStyles = {
  // 标准间距
  standard: {
    marginBottom: 24,
  },
  
  // 紧凑间距
  compact: {
    marginBottom: 16,
  },
  
  // 宽松间距
  spacious: {
    marginBottom: 32,
  },
  
  // 无间距
  none: {
    marginBottom: 0,
  },
}

// 统一的按钮样式配置
export const buttonStyles = {
  // 主要操作按钮
  primary: {
    type: 'primary' as const,
    size: 'large' as const,
    style: {
      minWidth: 120,
      height: 40,
    },
  },
  
  // 次要操作按钮
  secondary: {
    size: 'large' as const,
    style: {
      minWidth: 100,
      height: 40,
    },
  },
  
  // 危险操作按钮
  danger: {
    danger: true,
    size: 'large' as const,
    style: {
      minWidth: 100,
      height: 40,
    },
  },
  
  // 小按钮
  small: {
    size: 'small' as const,
    style: {
      minWidth: 80,
      height: 32,
    },
  },
}

// 统一的输入框样式
export const inputStyles = {
  // 标准输入框
  standard: {
    size: 'large' as const,
    style: {
      borderRadius: 6,
    },
  },
  
  // 搜索输入框
  search: {
    size: 'large' as const,
    allowClear: true,
    style: {
      borderRadius: 20,
    },
  },
  
  // 文本域
  textarea: {
    rows: 4,
    showCount: true,
    style: {
      borderRadius: 6,
      resize: 'vertical' as const,
    },
  },
  
  // 富文本编辑器容器
  richEditor: {
    style: {
      minHeight: 300,
      border: '1px solid #d9d9d9',
      borderRadius: 6,
      padding: 12,
    },
  },
}

// 统一的选择器样式
export const selectStyles = {
  // 标准选择器
  standard: {
    size: 'large' as const,
    style: {
      width: '100%',
      borderRadius: 6,
    },
  },
  
  // 多选选择器
  multiple: {
    mode: 'multiple' as const,
    size: 'large' as const,
    allowClear: true,
    style: {
      width: '100%',
      borderRadius: 6,
    },
  },
  
  // 标签选择器
  tags: {
    mode: 'tags' as const,
    size: 'large' as const,
    allowClear: true,
    style: {
      width: '100%',
      borderRadius: 6,
    },
  },
}

// 统一的日期选择器样式
export const datePickerStyles = {
  // 标准日期选择器
  standard: {
    size: 'large' as const,
    style: {
      width: '100%',
      borderRadius: 6,
    },
  },
  
  // 日期范围选择器
  range: {
    size: 'large' as const,
    style: {
      width: '100%',
      borderRadius: 6,
    },
  },
  
  // 日期时间选择器
  datetime: {
    showTime: true,
    size: 'large' as const,
    style: {
      width: '100%',
      borderRadius: 6,
    },
  },
}

// 统一的上传组件样式
export const uploadStyles = {
  // 拖拽上传
  dragger: {
    style: {
      borderRadius: 6,
      borderStyle: 'dashed',
      backgroundColor: '#fafafa',
    },
  },
  
  // 图片上传
  image: {
    listType: 'picture-card' as const,
    style: {
      borderRadius: 6,
    },
  },
  
  // 文件上传
  file: {
    style: {
      width: '100%',
    },
  },
}

// 统一的表单容器样式
export const formContainerStyles = {
  // 标准表单容器
  standard: {
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  
  // 卡片表单容器
  card: {
    padding: '32px',
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f0f0f0',
  },
  
  // 简洁表单容器
  minimal: {
    padding: '16px',
    backgroundColor: 'transparent',
  },
  
  // 模态框表单容器
  modal: {
    padding: '0',
    backgroundColor: 'transparent',
  },
}

// 统一的表单分组样式
export const formGroupStyles = {
  // 标准分组
  standard: {
    marginBottom: 32,
    padding: '16px',
    backgroundColor: '#fafafa',
    borderRadius: 6,
    border: '1px solid #f0f0f0',
  },
  
  // 卡片分组
  card: {
    marginBottom: 24,
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f0f0f0',
  },
  
  // 简洁分组
  minimal: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1px solid #f0f0f0',
  },
}

// 统一的标题样式
export const titleStyles = {
  // 表单主标题
  main: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#262626',
    marginBottom: '24px',
    lineHeight: 1.4,
  },
  
  // 表单副标题
  sub: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#595959',
    marginBottom: '16px',
    lineHeight: 1.4,
  },
  
  // 分组标题
  group: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#262626',
    marginBottom: '12px',
    lineHeight: 1.4,
  },
  
  // 字段标题
  field: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#262626',
    lineHeight: 1.4,
  },
}

// 统一的间距配置
export const spacingConfig = {
  // 表单项间距
  formItem: {
    small: 12,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  
  // 分组间距
  group: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
  
  // 按钮间距
  button: {
    small: 8,
    medium: 12,
    large: 16,
  },
}

// 统一的颜色配置
export const colorConfig = {
  // 主色调
  primary: '#1890ff',
  
  // 成功色
  success: '#52c41a',
  
  // 警告色
  warning: '#faad14',
  
  // 错误色
  error: '#ff4d4f',
  
  // 信息色
  info: '#1890ff',
  
  // 文本颜色
  text: {
    primary: '#262626',
    secondary: '#595959',
    disabled: '#bfbfbf',
    placeholder: '#bfbfbf',
  },
  
  // 背景颜色
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    disabled: '#f5f5f5',
  },
  
  // 边框颜色
  border: {
    primary: '#d9d9d9',
    secondary: '#f0f0f0',
    focus: '#40a9ff',
  },
}

// 导出所有样式配置
export const formStyles = {
  layout: formLayout,
  item: formItemStyles,
  button: buttonStyles,
  input: inputStyles,
  select: selectStyles,
  datePicker: datePickerStyles,
  upload: uploadStyles,
  container: formContainerStyles,
  group: formGroupStyles,
  title: titleStyles,
  spacing: spacingConfig,
  color: colorConfig,
}

export default formStyles