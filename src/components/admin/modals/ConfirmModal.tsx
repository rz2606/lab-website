import React from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import AdminModal, { ModalFooter, ModalButton } from './AdminModal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info' | 'success'
  loading?: boolean
  showIcon?: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning',
  loading = false,
  showIcon = true
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('确认操作失败:', error)
      // 不关闭模态框，让用户看到错误
    }
  }

  // 图标和样式配置
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      buttonVariant: 'primary' as const
    },
    danger: {
      icon: XCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      buttonVariant: 'danger' as const
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      buttonVariant: 'primary' as const
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      buttonVariant: 'primary' as const
    }
  }

  const config = typeConfig[type]
  const IconComponent = config.icon

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="sm:flex sm:items-start">
        {showIcon && (
          <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
            <IconComponent className={`h-6 w-6 ${config.iconColor}`} aria-hidden="true" />
          </div>
        )}
        <div className={`mt-3 text-center sm:mt-0 ${showIcon ? 'sm:ml-4' : ''} sm:text-left`}>
          <div className="mt-2">
            <p className="text-sm text-gray-500 whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <ModalButton
          onClick={handleConfirm}
          variant={config.buttonVariant}
          loading={loading}
          disabled={loading}
        >
          {confirmText}
        </ModalButton>
        <ModalButton
          onClick={onClose}
          variant="secondary"
          disabled={loading}
        >
          {cancelText}
        </ModalButton>
      </ModalFooter>
    </AdminModal>
  )
}

// 预设的确认对话框组件
export const DeleteConfirmModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  itemName?: string
  loading?: boolean
}> = ({ isOpen, onClose, onConfirm, itemName = '此项', loading = false }) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="确认删除"
      message={`确定要删除${itemName}吗？此操作不可撤销。`}
      confirmText="删除"
      cancelText="取消"
      type="danger"
      loading={loading}
    />
  )
}

export const SaveConfirmModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  loading?: boolean
  hasUnsavedChanges?: boolean
}> = ({ isOpen, onClose, onConfirm, loading = false, hasUnsavedChanges = true }) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="保存更改"
      message={hasUnsavedChanges ? '您有未保存的更改，确定要保存吗？' : '确定要保存当前内容吗？'}
      confirmText="保存"
      cancelText="取消"
      type="info"
      loading={loading}
    />
  )
}

export const DiscardChangesModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  loading?: boolean
}> = ({ isOpen, onClose, onConfirm, loading = false }) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="放弃更改"
      message="您有未保存的更改，确定要放弃这些更改吗？"
      confirmText="放弃"
      cancelText="继续编辑"
      type="warning"
      loading={loading}
    />
  )
}

export const LogoutConfirmModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  loading?: boolean
}> = ({ isOpen, onClose, onConfirm, loading = false }) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="确认退出"
      message="确定要退出登录吗？"
      confirmText="退出"
      cancelText="取消"
      type="warning"
      loading={loading}
    />
  )
}

export default ConfirmModal