// 用户CRUD接口测试
// 这个文件包含了用户管理API的完整测试用例

const BASE_URL = 'http://localhost:3000/api'

// 测试数据
const testUser = {
  username: 'testuser123',
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  name: '测试用户',
  roleType: 'user'
}

const updatedUser = {
  username: 'updateduser123',
  email: 'updated@example.com',
  name: '更新的测试用户',
  roleType: 'admin',
  isActive: false
}

// 模拟管理员token（实际使用时需要真实的JWT token）
const ADMIN_TOKEN = 'your-admin-jwt-token-here'

// 辅助函数：发送HTTP请求
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      ...options.headers
    },
    ...options
  }
  
  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    return {
      status: response.status,
      ok: response.ok,
      data
    }
  } catch (error) {
    console.error(`API请求失败: ${endpoint}`, error)
    throw error
  }
}

// 测试用例
class UserAPITests {
  constructor() {
    this.createdUserId = null
  }

  // 1. 测试获取用户列表
  async testGetUsers() {
    console.log('\n=== 测试获取用户列表 ===')
    
    try {
      const result = await apiRequest('/users')
      
      console.log('状态码:', result.status)
      console.log('响应数据:', JSON.stringify(result.data, null, 2))
      
      if (result.ok) {
        console.log('✅ 获取用户列表成功')
        
        // 验证响应结构
        if (result.data.data && Array.isArray(result.data.data)) {
          console.log('✅ 响应数据结构正确')
          console.log(`📊 用户总数: ${result.data.pagination?.total || 0}`)
        } else {
          console.log('❌ 响应数据结构错误')
        }
      } else {
        console.log('❌ 获取用户列表失败:', result.data.error)
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message)
    }
  }

  // 2. 测试创建用户
  async testCreateUser() {
    console.log('\n=== 测试创建用户 ===')
    
    try {
      const result = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(testUser)
      })
      
      console.log('状态码:', result.status)
      console.log('响应数据:', JSON.stringify(result.data, null, 2))
      
      if (result.ok) {
        console.log('✅ 创建用户成功')
        this.createdUserId = result.data.id
        console.log(`📝 创建的用户ID: ${this.createdUserId}`)
        
        // 验证返回的用户数据
        if (result.data.username === testUser.username && 
            result.data.email === testUser.email) {
          console.log('✅ 用户数据验证正确')
        } else {
          console.log('❌ 用户数据验证失败')
        }
      } else {
        console.log('❌ 创建用户失败:', result.data.error)
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message)
    }
  }

  // 3. 测试获取单个用户
  async testGetUser() {
    if (!this.createdUserId) {
      console.log('\n⚠️  跳过获取单个用户测试 - 没有可用的用户ID')
      return
    }
    
    console.log('\n=== 测试获取单个用户 ===')
    
    try {
      const result = await apiRequest(`/users/${this.createdUserId}`)
      
      console.log('状态码:', result.status)
      console.log('响应数据:', JSON.stringify(result.data, null, 2))
      
      if (result.ok) {
        console.log('✅ 获取用户详情成功')
        
        // 验证用户数据
        if (result.data.id === this.createdUserId) {
          console.log('✅ 用户ID匹配正确')
        } else {
          console.log('❌ 用户ID不匹配')
        }
      } else {
        console.log('❌ 获取用户详情失败:', result.data.error)
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message)
    }
  }

  // 4. 测试更新用户
  async testUpdateUser() {
    if (!this.createdUserId) {
      console.log('\n⚠️  跳过更新用户测试 - 没有可用的用户ID')
      return
    }
    
    console.log('\n=== 测试更新用户 ===')
    
    try {
      const result = await apiRequest(`/users/${this.createdUserId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedUser)
      })
      
      console.log('状态码:', result.status)
      console.log('响应数据:', JSON.stringify(result.data, null, 2))
      
      if (result.ok) {
        console.log('✅ 更新用户成功')
        
        // 验证更新的数据
        if (result.data.username === updatedUser.username && 
            result.data.email === updatedUser.email) {
          console.log('✅ 用户数据更新验证正确')
        } else {
          console.log('❌ 用户数据更新验证失败')
        }
      } else {
        console.log('❌ 更新用户失败:', result.data.error)
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message)
    }
  }

  // 5. 测试删除用户
  async testDeleteUser() {
    if (!this.createdUserId) {
      console.log('\n⚠️  跳过删除用户测试 - 没有可用的用户ID')
      return
    }
    
    console.log('\n=== 测试删除用户 ===')
    
    try {
      const result = await apiRequest(`/users/${this.createdUserId}`, {
        method: 'DELETE'
      })
      
      console.log('状态码:', result.status)
      console.log('响应数据:', JSON.stringify(result.data, null, 2))
      
      if (result.ok) {
        console.log('✅ 删除用户成功')
        
        // 验证用户是否真的被删除
        const verifyResult = await apiRequest(`/users/${this.createdUserId}`)
        if (verifyResult.status === 404) {
          console.log('✅ 用户删除验证成功 - 用户不存在')
        } else {
          console.log('❌ 用户删除验证失败 - 用户仍然存在')
        }
      } else {
        console.log('❌ 删除用户失败:', result.data.error)
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message)
    }
  }

  // 6. 测试错误情况
  async testErrorCases() {
    console.log('\n=== 测试错误情况 ===')
    
    // 测试创建重复用户
    console.log('\n--- 测试创建重复用户 ---')
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(testUser)
      })
      
      const duplicateResult = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(testUser)
      })
      
      if (duplicateResult.status === 400) {
        console.log('✅ 重复用户验证正确 - 返回400错误')
      } else {
        console.log('❌ 重复用户验证失败')
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message)
    }
    
    // 测试获取不存在的用户
    console.log('\n--- 测试获取不存在的用户 ---')
    try {
      const result = await apiRequest('/users/99999')
      
      if (result.status === 404) {
        console.log('✅ 不存在用户验证正确 - 返回404错误')
      } else {
        console.log('❌ 不存在用户验证失败')
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message)
    }
    
    // 测试无效数据创建用户
    console.log('\n--- 测试无效数据创建用户 ---')
    try {
      const result = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({ username: '', email: '', password: '' })
      })
      
      if (result.status === 400) {
        console.log('✅ 无效数据验证正确 - 返回400错误')
      } else {
        console.log('❌ 无效数据验证失败')
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message)
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始用户CRUD接口测试')
    console.log('=' .repeat(50))
    
    await this.testGetUsers()
    await this.testCreateUser()
    await this.testGetUser()
    await this.testUpdateUser()
    await this.testDeleteUser()
    await this.testErrorCases()
    
    console.log('\n' + '='.repeat(50))
    console.log('🏁 用户CRUD接口测试完成')
  }
}

// 使用说明
console.log(`
📋 用户CRUD接口测试使用说明:

1. 确保开发服务器正在运行 (npm run dev)
2. 更新 ADMIN_TOKEN 变量为有效的管理员JWT token
3. 运行测试: node tests/api/users.test.js

⚠️  注意事项:
- 测试会创建和删除真实的用户数据
- 请在测试环境中运行，避免影响生产数据
- 确保数据库连接正常
`)

// 如果直接运行此文件，执行测试
if (require.main === module) {
  const tests = new UserAPITests()
  tests.runAllTests().catch(console.error)
}

module.exports = UserAPITests