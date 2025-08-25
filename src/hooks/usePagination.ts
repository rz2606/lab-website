import { useState, useCallback } from 'react'
import { PaginationInfo, AdminTabType } from '@/types/admin'

interface UsePaginationProps {
  onPageChange?: (type: AdminTabType, page: number, pageSize: number) => void
}

export const usePagination = ({ onPageChange }: UsePaginationProps = {}) => {
  const [paginationState, setPaginationState] = useState<Record<AdminTabType, PaginationInfo>>({
    users: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    publications: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    tools: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    news: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    team: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    awards: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    articles: { currentPage: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
  })

  // 更新分页信息
  const updatePagination = useCallback((type: AdminTabType, pagination: PaginationInfo) => {
    setPaginationState(prev => ({
      ...prev,
      [type]: pagination
    }))
  }, [])

  // 获取指定类型的分页信息
  const getPagination = useCallback((type: AdminTabType): PaginationInfo => {
    return paginationState[type]
  }, [paginationState])

  // 处理页码变化
  const handlePageChange = useCallback((type: AdminTabType, page: number) => {
    const currentPagination = paginationState[type]
    const newPagination = {
      ...currentPagination,
      currentPage: page
    }
    
    updatePagination(type, newPagination)
    onPageChange?.(type, page, currentPagination.pageSize)
  }, [paginationState, updatePagination, onPageChange])

  // 处理每页大小变化
  const handlePageSizeChange = useCallback((type: AdminTabType, pageSize: number) => {
    const newPagination = {
      ...paginationState[type],
      pageSize,
      currentPage: 1 // 重置到第一页
    }
    
    updatePagination(type, newPagination)
    onPageChange?.(type, 1, pageSize)
  }, [paginationState, updatePagination, onPageChange])

  // 重置分页
  const resetPagination = useCallback((type: AdminTabType) => {
    const resetPagination = {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
    
    updatePagination(type, resetPagination)
  }, [updatePagination])

  // 计算分页范围
  const getPageRange = useCallback((type: AdminTabType) => {
    const pagination = paginationState[type]
    const { currentPage, pageSize, total } = pagination
    
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, total)
    
    return { start, end, total }
  }, [paginationState])

  // 检查是否有上一页
  const hasPrevPage = useCallback((type: AdminTabType) => {
    return paginationState[type].currentPage > 1
  }, [paginationState])

  // 检查是否有下一页
  const hasNextPage = useCallback((type: AdminTabType) => {
    const pagination = paginationState[type]
    return pagination.currentPage < pagination.totalPages
  }, [paginationState])

  // 获取页码列表（用于分页组件显示）
  const getPageNumbers = useCallback((type: AdminTabType, maxVisible: number = 5) => {
    const pagination = paginationState[type]
    const { currentPage, totalPages } = pagination
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [paginationState])

  return {
    paginationState,
    updatePagination,
    getPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    getPageRange,
    hasPrevPage,
    hasNextPage,
    getPageNumbers
  }
}