'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface TagSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const PREDEFINED_TAGS = [
  '深度学习',
  '机器学习',
  '分子生成',
  '性质预测',
  '优化算法',
  '数据挖掘',
  '结构预测',
  '药物设计',
  '生物信息学',
  '化学信息学',
  '人工智能',
  '神经网络',
  '分子对接',
  '虚拟筛选',
  '量子化学',
  '分子动力学',
  '蛋白质结构',
  '基因组学',
  '转录组学',
  '代谢组学',
  '数据可视化',
  '统计分析',
  '图神经网络',
  '强化学习',
  '自然语言处理'
]

export default function TagSelector({ value, onChange, placeholder, className }: TagSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  // 将字符串转换为标签数组
  const selectedTags = value ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : []
  
  // 过滤可用标签
  const filteredTags = PREDEFINED_TAGS.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // 切换标签选择状态
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // 移除标签
      const newTags = selectedTags.filter(t => t !== tag)
      onChange(newTags.join(','))
    } else {
      // 添加标签
      const newTags = [...selectedTags, tag]
      onChange(newTags.join(','))
    }
  }
  
  // 移除标签
  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    onChange(newTags.join(','))
  }
  
  // 添加自定义标签
  const addCustomTag = () => {
    if (searchTerm.trim() && !selectedTags.includes(searchTerm.trim()) && !PREDEFINED_TAGS.includes(searchTerm.trim())) {
      const newTags = [...selectedTags, searchTerm.trim()]
      onChange(newTags.join(','))
      setSearchTerm('')
    }
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 已选择的标签 */}
      {selectedTags.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">已选择的标签：</div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* 搜索输入框 */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder || "搜索或添加标签..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm.trim() && !PREDEFINED_TAGS.includes(searchTerm.trim()) && !selectedTags.includes(searchTerm.trim()) && (
          <div className="mt-2">
            <button
              type="button"
              onClick={addCustomTag}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              添加自定义标签 &quot;{searchTerm.trim()}&quot;
            </button>
          </div>
        )}
      </div>
      
      {/* 标签按钮网格 */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">选择标签：</div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {filteredTags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}