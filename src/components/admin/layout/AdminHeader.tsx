import React, { useState } from 'react'
// import { useRouter } from 'next/router'
import { Bell, Settings, User, LogOut, Menu, Search, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface AdminHeaderProps {
  onMenuToggle?: () => void
  className?: string
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, className = '' }) => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 模拟通知数据
  const notifications = [
    {
      id: '1',
      title: '新用户注册',
      message: '用户 "张三" 已成功注册',
      time: '5分钟前',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: '系统更新',
      message: '系统将在今晚23:00进行维护更新',
      time: '1小时前',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: '数据备份完成',
      message: '今日数据备份已成功完成',
      time: '2小时前',
      read: true,
      type: 'success'
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // 这里可以添加实际的主题切换逻辑
    document.documentElement.classList.toggle('dark')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 这里可以添加搜索逻辑
      console.log('搜索:', searchQuery)
    }
  }

  const markNotificationAsRead = (notificationId: string) => {
    // 这里可以添加标记通知为已读的逻辑
    console.log('标记通知为已读:', notificationId)
  }

  const markAllAsRead = () => {
    // 这里可以添加标记所有通知为已读的逻辑
    console.log('标记所有通知为已读')
  }

  return (
    <header className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* 左侧：菜单按钮和搜索 */}
        <div className="flex items-center space-x-4">
          {/* 移动端菜单按钮 */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索用户、内容..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </form>
        </div>

        {/* 右侧：操作按钮和用户菜单 */}
        <div className="flex items-center space-x-3">
          {/* 主题切换 */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* 通知 */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* 通知下拉菜单 */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">通知</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-500"
                        >
                          全部标记为已读
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        暂无通知
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                            notification.read
                              ? 'border-transparent'
                              : notification.type === 'success'
                              ? 'border-green-400'
                              : notification.type === 'warning'
                              ? 'border-yellow-400'
                              : 'border-blue-400'
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                notification.read ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </p>
                              <p className={`text-sm mt-1 ${
                                notification.read ? 'text-gray-500' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-500 w-full text-center">
                      查看所有通知
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 设置 */}
          <button
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            title="设置"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* 用户菜单 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || '管理员'}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || 'admin'}
                </div>
              </div>
            </button>

            {/* 用户下拉菜单 */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || '管理员'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email || 'admin@example.com'}
                    </div>
                  </div>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    个人资料
                  </button>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    账户设置
                  </button>
                  
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端搜索框 */}
      <div className="md:hidden mt-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索用户、内容..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </form>
      </div>

      {/* 点击外部关闭菜单 */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}

export default AdminHeader