'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clearAuth, isAuthenticated, getCurrentUser, isAdmin } from '@/lib/auth'

// 导入布局组件
import AdminLayout from '@/components/admin/layout/AdminLayout'
import UsersTab from '@/components/admin/tabs/UsersTab'
import TeamTab from '@/components/admin/tabs/TeamTab'
import PublicationsTab from '@/components/admin/tabs/PublicationsTab'
import ToolsTab from '@/components/admin/tabs/ToolsTab'
import NewsTab from '@/components/admin/tabs/NewsTab'
import AchievementsTab from '@/components/admin/tabs/AchievementsTab'

// 导入通用组件
import ErrorBoundary from '@/components/admin/common/ErrorBoundary'
import LoadingSpinner from '@/components/admin/common/LoadingSpinner'

// 仪表板组件
const DashboardTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">系统概览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">用户总数</h3>
            <p className="text-2xl font-bold text-blue-900">--</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">发表成果</h3>
            <p className="text-2xl font-bold text-green-900">--</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-600">工具数量</h3>
            <p className="text-2xl font-bold text-yellow-900">--</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">新闻动态</h3>
            <p className="text-2xl font-bold text-purple-900">--</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">添加用户</h4>
            <p className="text-sm text-gray-500">创建新的系统用户</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">发布新闻</h4>
            <p className="text-sm text-gray-500">发布最新动态</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">数据分析</h4>
            <p className="text-sm text-gray-500">查看系统统计</p>
          </button>
        </div>
      </div>
    </div>
  )
}

// 分析组件
const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">数据分析</h2>
        <p className="text-gray-600">数据分析功能正在开发中...</p>
      </div>
    </div>
  )
}

// 设置组件
const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">系统设置</h2>
        <p className="text-gray-600">系统设置功能正在开发中...</p>
      </div>
    </div>
  )
}

// 主管理页面组件
function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; email: string; role: string } | null>(null)
  const [hasAdminAccess, setHasAdminAccess] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // 权限检查
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const user = getCurrentUser()
      const adminAccess = isAdmin()

      setCurrentUser(user)
      setHasAdminAccess(adminAccess)
      setAuthChecked(true)

      // 如果未登录，跳转到登录页
      if (!authenticated) {
        router.push('/login')
        return
      }

      // 如果不是管理员，显示权限不足提示
      if (!adminAccess) {
        return
      }
    }

    checkAuth()
  }, [router])

  // 退出登录
  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  // 标签页切换处理
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />
      case 'users':
        return <UsersTab />
      case 'team':
        return <TeamTab />
      case 'publications':
        return <PublicationsTab />
      case 'tools':
        return <ToolsTab />
      case 'news':
        return <NewsTab />
      case 'achievements':
        return <AchievementsTab />
      case 'analytics':
        return <AnalyticsTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <DashboardTab />
    }
  }

  // 如果还在检查认证状态，显示加载界面
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // 如果没有管理员权限，显示权限不足界面
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">权限不足</h2>
          <p className="text-gray-600 mb-4">您没有访问管理后台的权限。</p>
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            返回登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <AdminLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        {renderTabContent()}
      </AdminLayout>
    </ErrorBoundary>
  )
}

export default AdminPage