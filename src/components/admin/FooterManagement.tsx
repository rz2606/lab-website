'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Trash2, Save, Edit } from 'lucide-react'

interface FooterLink {
  name: string
  url: string
}

interface FooterConfig {
  id: number
  title: string
  description: string
  copyright: string
  icp?: string
  email?: string
  phone?: string
  address?: string
  links?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const FooterManagement: React.FC = () => {
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    copyright: '',
    icp: '',
    email: '',
    phone: '',
    address: '',
    links: [] as FooterLink[]
  })

  // 获取页脚配置
  const fetchFooterConfig = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/footer')
      
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setFooterConfig(data.data)
          // 处理links字段的双重JSON编码问题
          let links = []
          if (data.data.links) {
            try {
              // 如果links是字符串，先解析一次
              const parsedLinks = typeof data.data.links === 'string' ? JSON.parse(data.data.links) : data.data.links
              // 如果解析后还是字符串，再解析一次
              links = typeof parsedLinks === 'string' ? JSON.parse(parsedLinks) : parsedLinks
            } catch (e) {
              console.error('解析links字段失败:', e)
              links = []
            }
          }
          
          setFormData({
            title: data.data.title || '',
            description: data.data.description || '',
            copyright: data.data.copyright || '',
            icp: data.data.icp || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
            address: data.data.address || '',
            links: links
          })
        }
      } else {
        console.error('获取页脚配置失败')
      }
    } catch (error) {
      console.error('获取页脚配置时出错:', error)
      setError('获取页脚配置失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 保存页脚配置
  const saveFooterConfig = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        return
      }

      const method = footerConfig ? 'PUT' : 'POST'
      const url = footerConfig ? `/api/footer?id=${footerConfig.id}` : '/api/footer'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          ...(footerConfig && { id: footerConfig.id }),
          links: formData.links
        })
      })

      if (response.ok) {
        setSuccess('页脚配置保存成功')
        setIsEditing(false)
        await fetchFooterConfig()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '保存失败')
      }
    } catch (error) {
      console.error('保存页脚配置时出错:', error)
      setError('保存页脚配置失败')
    } finally {
      setIsSaving(false)
    }
  }

  // 删除页脚配置
  const deleteFooterConfig = async () => {
    if (!footerConfig || !confirm('确定要删除当前页脚配置吗？')) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        return
      }

      const response = await fetch(`/api/footer?id=${footerConfig.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccess('页脚配置删除成功')
        setFooterConfig(null)
        setFormData({
          title: '',
          description: '',
          copyright: '',
          icp: '',
          email: '',
          phone: '',
          address: '',
          links: []
        })
        setIsEditing(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '删除失败')
      }
    } catch (error) {
      console.error('删除页脚配置时出错:', error)
      setError('删除页脚配置失败')
    } finally {
      setIsSaving(false)
    }
  }

  // 添加链接
  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { name: '', url: '' }]
    }))
  }

  // 删除链接
  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
  }

  // 更新链接
  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  // 处理表单输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    fetchFooterConfig()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {footerConfig && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Button>
          )}
          {footerConfig && (
            <Button 
              onClick={deleteFooterConfig} 
              variant="destructive"
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4">
          {(!footerConfig || isEditing) ? (
            // 编辑模式
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="课题组名称"
                  />
                </div>
                <div>
                  <Label htmlFor="copyright">版权信息</Label>
                  <Input
                    id="copyright"
                    value={formData.copyright}
                    onChange={(e) => handleInputChange('copyright', e.target.value)}
                    placeholder="© 2024 课题组名称"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="课题组简介"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">电话</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+86 123-4567-8900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">地址</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="详细地址"
                  />
                </div>
                <div>
                  <Label htmlFor="icp">ICP备案号</Label>
                  <Input
                    id="icp"
                    value={formData.icp}
                    onChange={(e) => handleInputChange('icp', e.target.value)}
                    placeholder="京ICP备xxxxxxxx号"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>友情链接</Label>
                  <Button onClick={addLink} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    添加链接
                  </Button>
                </div>
                {formData.links.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="链接名称"
                      value={link.name}
                      onChange={(e) => updateLink(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="链接地址"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                    />
                    <Button
                      onClick={() => removeLink(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={saveFooterConfig} 
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                {footerConfig && isEditing && (
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline"
                  >
                    取消
                  </Button>
                )}
              </div>
            </>
          ) : (
            // 查看模式
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>标题</Label>
                  <p className="text-sm text-gray-600">{footerConfig.title || '未设置'}</p>
                </div>
                <div>
                  <Label>版权信息</Label>
                  <p className="text-sm text-gray-600">{footerConfig.copyright || '未设置'}</p>
                </div>
              </div>
              
              <div>
                <Label>描述</Label>
                <p className="text-sm text-gray-600">{footerConfig.description || '未设置'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>邮箱</Label>
                  <p className="text-sm text-gray-600">{footerConfig.email || '未设置'}</p>
                </div>
                <div>
                  <Label>电话</Label>
                  <p className="text-sm text-gray-600">{footerConfig.phone || '未设置'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>地址</Label>
                  <p className="text-sm text-gray-600">{footerConfig.address || '未设置'}</p>
                </div>
                <div>
                  <Label>ICP备案号</Label>
                  <p className="text-sm text-gray-600">{footerConfig.icp || '未设置'}</p>
                </div>
              </div>
              
              {footerConfig.links && (() => {
                try {
                  const links = JSON.parse(footerConfig.links)
                  return links.length > 0 && (
                    <div>
                      <Label>友情链接</Label>
                      <div className="space-y-1">
                        {links.map((link: FooterLink, index: number) => (
                          <p key={index} className="text-sm text-gray-600">
                            {link.name}: {link.url}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                } catch {
                  return null
                }
              })()}
              
              <div className="text-xs text-gray-500">
                最后更新: {new Date(footerConfig.updatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FooterManagement