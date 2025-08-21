import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // 主色调
    colorPrimary: '#667eea',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // 字体
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 14,
    
    // 圆角
    borderRadius: 6,
    
    // 间距
    padding: 16,
    margin: 16,
    
    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    
    // 背景色
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Form: {
      itemMarginBottom: 24,
      verticalLabelPadding: '0 0 8px',
    },
    Card: {
      borderRadius: 8,
      paddingLG: 24,
    },
    Modal: {
      borderRadius: 8,
    },
    Table: {
      borderRadius: 6,
    },
  },
};

export default theme;