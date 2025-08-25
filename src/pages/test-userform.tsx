import React from 'react'
import UserForm from '@/components/admin/forms/UserForm'
import type { User } from '@/types/admin'

// 测试UserForm组件渲染的页面
const TestUserFormPage: React.FC = () => {
  const handleSubmit = (userData: Partial<User>) => {
    console.log('测试提交数据:', userData)
    alert('表单提交测试成功！数据已打印到控制台。')
  }

  const handleCancel = () => {
    console.log('取消操作')
    alert('取消操作测试成功！')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            UserForm 组件渲染测试
          </h1>
          
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">测试说明</h2>
            <ul className="text-blue-700 space-y-1">
              <li>• 检查所有表单字段是否正常显示</li>
              <li>• 验证leftIcon图标是否正确渲染</li>
              <li>• 测试表单验证功能</li>
              <li>• 确认没有React渲染错误</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">新建用户表单</h3>
            <UserForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={false}
            />
          </div>

          <div className="mt-8 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">编辑用户表单（预填数据）</h3>
            <UserForm
              user={{
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                name: '测试用户',
                roleType: 'user',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z'
              }}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={false}
            />
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h2 className="text-lg font-semibold text-green-800 mb-2">测试结果</h2>
            <p className="text-green-700">
              如果您能看到上面的表单且没有控制台错误，说明 leftIcon 修复成功！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestUserFormPage