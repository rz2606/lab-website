import React, { useState, useCallback, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onSearch: (searchTerm: string) => void
  onClear?: () => void
  debounceMs?: number
  className?: string
  showClearButton?: boolean
  disabled?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索新闻标题、内容...',
  value = '',
  onSearch,
  onClear,
  debounceMs = 300,
  className = '',
  showClearButton = true,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState(value)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // 防抖搜索
  const debouncedSearch = useCallback((term: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      onSearch(term)
    }, debounceMs)

    setDebounceTimer(timer)
  }, [onSearch, debounceMs, debounceTimer])

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    debouncedSearch(newValue)
  }

  // 处理清空
  const handleClear = () => {
    setSearchTerm('')
    onSearch('')
    onClear?.()
  }

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      onSearch(searchTerm)
    }
  }

  // 同步外部value变化
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* 搜索图标 */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        {/* 输入框 */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md
            placeholder-gray-400 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
        />

        {/* 清空按钮 */}
        {showClearButton && searchTerm && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200"
            title="清空搜索"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* 搜索提示 */}
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 bg-white px-3 py-1 border border-gray-200 rounded-md shadow-sm z-10">
          搜索: &quot;{searchTerm}&quot;
        </div>
      )}
    </div>
  )
}

export default SearchBar