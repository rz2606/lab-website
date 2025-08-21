import React, { useState, useEffect } from 'react'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import ErrorBoundary from '../common/ErrorBoundary'
import LoadingSpinner from '../common/LoadingSpinner'
import { ToastProvider } from '../common/Toast'

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
  loading?: boolean
  className?: string
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab = 'dashboard',
  onTabChange,
  loading = false,
  className = '' 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarCollapsed(false)
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 处理侧边栏切换
  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // 处理移动端遮罩点击
  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // 处理标签页切换
  const handleTabChange = (tab: string) => {
    onTabChange?.(tab)
    // 移动端切换标签后关闭侧边栏
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <ToastProvider>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* 移动端遮罩 */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={handleOverlayClick}
        />
      )}

      {/* 侧边栏 */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
        ${isMobile ? (
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ) : (
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        ${isMobile ? 'w-64' : ''}
      `}>
        <AdminSidebar
          isCollapsed={!isMobile && sidebarCollapsed}
          onToggle={isMobile ? undefined : handleSidebarToggle}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="h-full"
        />
      </div>

      {/* 主内容区域 */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')}
      `}>
        {/* 头部 */}
        <AdminHeader
          onMenuToggle={handleSidebarToggle}
          showMenuButton={true}
          className="sticky top-0 z-30"
        />

        {/* 内容区域 */}
        <main className="p-6">
          <ErrorBoundary>
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              children
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* 页面底部 */}
      <footer className={`
        bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500
        transition-all duration-300 ease-in-out
        ${isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')}
      `}>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div>
            © 2024 实验室管理系统. 保留所有权利.
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span>版本 v1.0.0</span>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">
              帮助文档
            </a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">
              技术支持
            </a>
          </div>
        </div>
      </footer>
    </div>
    </ToastProvider>
  )
}

export default AdminLayout