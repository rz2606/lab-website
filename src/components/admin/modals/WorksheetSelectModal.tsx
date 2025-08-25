import React, { useState } from 'react'
import { FileSpreadsheet, Check } from 'lucide-react'
import AdminModal, { ModalFooter, ModalButton } from './AdminModal'
import type { WorksheetInfo } from '@/types/admin'

interface WorksheetSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedWorksheet: string) => void
  worksheets: WorksheetInfo[]
  loading?: boolean
  title?: string
}

const WorksheetSelectModal: React.FC<WorksheetSelectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  worksheets,
  loading = false,
  title = '选择工作表'
}) => {
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('')

  // 重置选择状态
  React.useEffect(() => {
    if (isOpen && worksheets.length > 0) {
      setSelectedWorksheet(worksheets[0].name)
    }
  }, [isOpen, worksheets])

  const handleConfirm = () => {
    if (selectedWorksheet) {
      onConfirm(selectedWorksheet)
    }
  }

  const handleClose = () => {
    setSelectedWorksheet('')
    onClose()
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="space-y-4">
        {/* 说明文字 */}
        <div className="flex items-start space-x-3">
          <FileSpreadsheet className="h-6 w-6 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700">
              检测到Excel文件包含多个工作表，请选择要导入的工作表：
            </p>
          </div>
        </div>

        {/* 工作表列表 */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {worksheets.map((worksheet) => (
            <div
              key={worksheet.name}
              className={`
                relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                ${
                  selectedWorksheet === worksheet.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => setSelectedWorksheet(worksheet.name)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {worksheet.name}
                  </h4>
                  {selectedWorksheet === worksheet.name && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                  <span>行数: {worksheet.rowCount}</span>
                  <span>列数: {worksheet.columnCount}</span>
                  {worksheet.hasHeaders && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      包含标题行
                    </span>
                  )}
                </div>

                {/* 预览前几列的标题 */}
                {worksheet.headers && worksheet.headers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">列标题预览:</p>
                    <div className="flex flex-wrap gap-1">
                      {worksheet.headers.slice(0, 6).map((header, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {header}
                        </span>
                      ))}
                      {worksheet.headers.length > 6 && (
                        <span className="text-xs text-gray-400">
                          +{worksheet.headers.length - 6} 更多
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 选择指示器 */}
              <input
                type="radio"
                name="worksheet"
                value={worksheet.name}
                checked={selectedWorksheet === worksheet.name}
                onChange={() => setSelectedWorksheet(worksheet.name)}
                className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
            </div>
          ))}
        </div>

        {/* 提示信息 */}
        {worksheets.length === 0 && (
          <div className="text-center py-8">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">没有找到可用的工作表</p>
          </div>
        )}

        {/* 导入说明 */}
        {worksheets.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  导入说明
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>请确保选择的工作表包含正确的数据格式</li>
                    <li>第一行应为列标题（如果有标题行）</li>
                    <li>空行和无效数据将被自动跳过</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <ModalButton
          onClick={handleConfirm}
          variant="primary"
          disabled={!selectedWorksheet || loading}
          loading={loading}
        >
          确认导入
        </ModalButton>
        <ModalButton
          onClick={handleClose}
          variant="secondary"
          disabled={loading}
        >
          取消
        </ModalButton>
      </ModalFooter>
    </AdminModal>
  )
}

export default WorksheetSelectModal