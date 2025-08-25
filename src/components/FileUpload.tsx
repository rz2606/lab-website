'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  accept?: string
  maxSize?: number // MB
  placeholder?: string
  className?: string
  showPreview?: boolean
}

const FileUpload = ({
  value,
  onChange,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSize = 10,
  placeholder = '点击上传文件或拖拽文件到此处',
  className = '',
  showPreview = true
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`文件大小不能超过${maxSize}MB`)
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

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

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
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  }

  const getFileIcon = (url: string) => {
    if (isImage(url)) return <ImageIcon size={24} />
    if (url.includes('.pdf')) return <File size={24} className="text-red-500" />
    if (url.includes('.doc') || url.includes('.docx')) return <File size={24} className="text-blue-500" />
    if (url.includes('.xls') || url.includes('.xlsx')) return <File size={24} className="text-green-500" />
    return <File size={24} />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传区域 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={!uploading ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">上传中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload size={32} className="text-gray-400" />
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-400">
              支持图片、PDF、Word、Excel文件，最大{maxSize}MB
            </p>
          </div>
        )}
      </div>

      {/* 文件预览 */}
      {value && showPreview && (
        <div className="relative">
          {isImage(value) ? (
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
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
              {getFileIcon(value)}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {value.split('/').pop()}
                </p>
                <p className="text-xs text-gray-500">已上传</p>
              </div>
              <button
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FileUpload