import React from 'react'
import ConfirmModal from './ConfirmModal'

export interface DeleteConfirmDialogProps {
  isOpen?: boolean
  open?: boolean
  title?: string
  itemName?: string
  warningText?: string
  isPending?: boolean
  isDeleting?: boolean
  onCancel?: () => void
  onClose?: () => void
  onSoftDelete?: () => void
  onConfirm?: () => void
  onArchive?: () => void
  confirmText?: string
  cancelText?: string
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  open,
  title,
  itemName,
  warningText,
  isPending = false,
  isDeleting = false,
  onCancel,
  onClose,
  onSoftDelete,
  onConfirm,
  confirmText,
  cancelText,
}) => {
  return (
    <ConfirmModal
      isOpen={open ?? isOpen ?? false}
      variant="danger"
      title={title}
      itemName={itemName}
      warningText={warningText}
      isPending={isPending || isDeleting}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm ?? onSoftDelete ?? (() => {})}
      onCancel={onClose ?? onCancel ?? (() => {})}
    />
  )
}

export default DeleteConfirmDialog
