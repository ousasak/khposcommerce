import React, { useState, useEffect } from 'react'
import { XCircle } from 'lucide-react'
import { EnterpriseModal } from './Modal'
import { ModalFooter } from './ModalFooter'
import { Textarea } from './Textarea'
import { useThemeStore } from '@/stores/themeStore'

export interface RejectConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  title?: string
  subtitle?: string
  itemName?: string
  label?: string
  placeholder?: string
  confirmText?: string
  cancelText?: string
  isPending?: boolean
  required?: boolean
  presetReasons?: string[]
}

const DEFAULT_PRESET_REASONS_KM = [
  'ទំនិញខូចខាតដោយសារអតិថិជន',
  'ផុតកំណត់កាលបរិច្ឆេទសង (លើស 7 ថ្ងៃ)',
  'មិនមានវិក្កយបត្រដើមបញ្ជាក់',
  'គ្រឿងបន្លាស់ ឬប្រអប់មិនគ្រប់គ្រាន់',
  'ទំនិញមិនត្រូវគ្នានឹងកូដ IMEI/Serial',
]

const DEFAULT_PRESET_REASONS_EN = [
  'Customer induced damage',
  'Exceeded return policy window (> 7 days)',
  'Missing original invoice/receipt',
  'Missing box or accessories',
  'Serial/IMEI does not match original sale',
]

export const RejectConfirmDialog: React.FC<RejectConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  itemName,
  label,
  placeholder,
  confirmText,
  cancelText,
  isPending = false,
  required = true,
  presetReasons,
}) => {
  const { language } = useThemeStore()
  const isKhmer = language === 'km'
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setReason('')
      setError(null)
    }
  }, [isOpen])

  const defaultPresets = isKhmer ? DEFAULT_PRESET_REASONS_KM : DEFAULT_PRESET_REASONS_EN
  const presets = presetReasons || defaultPresets

  const handleSelectPreset = (preset: string) => {
    setReason((prev) => (prev ? `${prev}, ${preset}` : preset))
    setError(null)
  }

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault()
    if (required && !reason.trim()) {
      setError(isKhmer ? 'សូមបញ្ជាក់ពីមូលហេតុនៃការបដិសេធ' : 'Please provide a rejection reason')
      return
    }
    onConfirm(reason.trim())
  }

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon={<XCircle size={18} />}
      iconVariant="rose"
      title={title || (isKhmer ? 'បដិសេធសំណើសងទំនិញ' : 'Reject Return Request')}
      subtitle={
        subtitle ||
        (isKhmer
          ? 'សូមបញ្ជាក់ពីមូលហេតុនៃការបដិសេធ ដើម្បីជូនដំណឹងដល់អតិថិជន'
          : 'Please provide the rejection reason to notify the customer')
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          cancelLabel={cancelText || (isKhmer ? 'បោះបង់' : 'Cancel')}
          submitLabel={confirmText || (isKhmer ? 'បដិសេធសំណើ' : 'Reject Request')}
          submitVariant="danger"
          submitIcon={<XCircle size={14} strokeWidth={2.5} />}
          isSubmitting={isPending}
        />
      }
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {itemName && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 dark:bg-slate-900/60 border border-border/70 dark:border-slate-800 text-xs">
            <span className="text-muted-foreground">{isKhmer ? 'លេខកូដសំណើ / ទំនិញ៖' : 'Item / Reference:'}</span>
            <span className="font-mono font-bold text-foreground dark:text-slate-100">{itemName}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground dark:text-slate-200">
            {label || (isKhmer ? 'មូលហេតុនៃការបដិសេធ' : 'Rejection Reason')}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5 pb-1">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900 hover:bg-muted/50 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-all cursor-pointer text-left"
              >
                + {preset}
              </button>
            ))}
          </div>

          <Textarea
            rows={3}
            autoFocus
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            placeholder={
              placeholder ||
              (isKhmer
                ? 'បញ្ជាក់ព័ត៌មានលម្អិតពីមូលហេតុនៃការបដិសេធ...'
                : 'Enter details about why this request is being rejected...')
            }
            error={error}
          />
          {error && <p className="text-[11px] font-medium text-rose-500 mt-1">{error}</p>}
        </div>
      </form>
    </EnterpriseModal>
  )
}

export default RejectConfirmDialog
