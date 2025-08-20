import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { PaginationInfo } from '@/types/admin'

interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  className?: string
}

const Pagination: React.FC<PaginationProps> = ({
  pagination = { currentPage: 1, pageSize: 10, total: 0, totalPages: 0 },
  onPageChange,
  onPageSizeChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  className = ''
}) => {
  const { currentPage, pageSize, total, totalPages } = pagination

  // 计算显示的页码范围
  const getPageNumbers = () => {
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const pageNumbers = getPageNumbers()
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    if (newPageSize !== pageSize) {
      onPageSizeChange(newPageSize)
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 ${className}`}>
      <div className="flex items-center justify-between w-full">
        {/* 总数显示 */}
        {showTotal && (
          <div className="text-sm text-gray-700">
            显示第 <span className="font-medium">{startItem}</span> 到{' '}
            <span className="font-medium">{endItem}</span> 条，共{' '}
            <span className="font-medium">{total}</span> 条记录
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* 每页大小选择器 */}
          {showSizeChanger && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">每页</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">条</span>
            </div>
          )}

          {/* 分页控件 */}
          <div className="flex items-center space-x-1">
            {/* 首页 */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="首页"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* 上一页 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="上一页"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* 页码 */}
            <div className="flex items-center space-x-1">
              {pageNumbers[0] > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </>
              )}

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* 下一页 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="下一页"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* 末页 */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="末页"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* 快速跳转 */}
          {showQuickJumper && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">跳至</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt((e.target as HTMLInputElement).value)
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <span className="text-sm text-gray-700">页</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pagination