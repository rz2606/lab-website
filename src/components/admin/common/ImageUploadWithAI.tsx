'use client'

import React, { useState } from 'react'
import { Upload, Sparkles, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadWithAIProps {
  value?: string
  onChange: (url: string) => void
  summary?: string // 用于AI生成的摘要
  placeholder?: string
  className?: string
}

const ImageUploadWithAI: React.FC<ImageUploadWithAIProps> = ({
  value,
  onChange,
  summary = '',
  placeholder = '上传图片或使用AI生成',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      const result = await response.json()
      onChange(result.url)
    } catch (error) {
      console.error('上传失败:', error)
      alert(error instanceof Error ? error.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  // 处理AI生成图片
  const handleAIGenerate = async () => {
    if (!summary.trim()) {
      alert('请先填写新闻摘要，AI将根据摘要生成图片')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/ai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ summary: summary.trim() })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI生成失败')
      }

      const result = await response.json()
      if (result.success && result.imageUrl) {
        onChange(result.imageUrl)
      } else {
        throw new Error('AI生成失败')
      }
    } catch (error) {
      console.error('AI生成失败:', error)
      alert(error instanceof Error ? error.message : 'AI生成失败')
    } finally {
      setGenerating(false)
    }
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // 移除图片
  const handleRemove = () => {
    onChange('')
  }

  // 点击上传区域
  const handleClick = () => {
    if (!uploading && !generating) {
      fileInputRef.current?.click()
    }
  }

  const isLoading = uploading || generating

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI生成按钮 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAIGenerate}
          disabled={!summary.trim() || isLoading}
          className="
            inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
            bg-gradient-to-r from-purple-500 to-pink-500 text-white
            hover:from-purple-600 hover:to-pink-600
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-sm hover:shadow-md
          "
        >
          {generating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {generating ? 'AI生成中...' : 'AI生成图片'}
        </button>
      </div>

      {/* 上传区域 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">
              {uploading ? '上传中...' : '生成中...'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <Upload size={32} className="text-gray-400" />
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-400">
              支持JPG、PNG、GIF格式，最大10MB
            </p>
          </div>
        )}
      </div>

      {/* 图片预览 */}
      {value && (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="预览"
            width={200}
            height={200}
            className="rounded-lg object-cover border"
            unoptimized
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUploadWithAI