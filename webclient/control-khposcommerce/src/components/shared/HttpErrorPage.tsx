import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Compass,
  ArrowLeft,
  Search,
  RotateCw,
  ShieldAlert,
  AlertTriangle,
  WifiOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type HttpErrorCode =
  | 400
  | 401
  | 403
  | 404
  | 408
  | 429
  | 500
  | 502
  | 503
  | 504
  | 'app'
  | 'runtime'
  | 'offline'
  | 'unknown'

export interface HttpErrorPageProps {
  code?: HttpErrorCode
  title?: string
  subtitle?: string
  description?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  showRetryButton?: boolean
  showContactButton?: boolean
  onRetry?: () => void
  fullPage?: boolean
  error?: Error | null
  errorInfo?: React.ErrorInfo | null
  extraActions?: React.ReactNode
}

export const HttpErrorPage: React.FC<HttpErrorPageProps> = ({
  code = 'unknown',
  title,
  subtitle,
  description,
  showBackButton,
  showHomeButton = true,
  showRetryButton,
  showContactButton,
  onRetry,
  fullPage = true,
  error,
  errorInfo,
  extraActions,
}) => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('common')
  const [showDetails, setShowDetails] = useState(false)

  const isKhmer = i18n?.language === 'km' || i18n?.language?.startsWith('km') || i18n?.language?.startsWith('kh')
  const codeKey = String(code)
  const isClientError = codeKey === 'app' || codeKey === 'runtime'
  const isNumericCode = !isNaN(Number(codeKey))
  const lookupKey = isClientError ? 'app' : codeKey

  // Select badge icon matching Apex Shadcn visual style
  const getBadgeIcon = () => {
    switch (codeKey) {
      case '403':
      case '401':
        return <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.2} />
      case '500':
      case '502':
      case '503':
      case '504':
      case 'app':
      case 'runtime':
        return <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.2} />
      case 'offline':
        return <WifiOff className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.2} />
      case '404':
      default:
        return <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.2} />
    }
  }

  const displayCode = isClientError ? '500' : (codeKey === 'offline' ? 'Offline' : (codeKey === 'unknown' ? '404' : codeKey))

  // Localized Headings & Titles
  const defaultTitle = isKhmer
    ? (codeKey === '404' || codeKey === 'unknown'
        ? 'រកមិនឃើញទំព័រទេ'
        : isClientError || codeKey === '500'
        ? 'មានបញ្ហាបច្ចេកទេសក្នុងប្រព័ន្ធ'
        : codeKey === '403'
        ? 'គ្មានសិទ្ធិចូលប្រើប្រាស់ទេ'
        : 'មានបញ្ហាក្នុងការផ្ទុកទំព័រ')
    : (codeKey === '404' || codeKey === 'unknown'
        ? 'Page not found'
        : isClientError || codeKey === '500'
        ? 'Internal Server Error'
        : codeKey === '403'
        ? 'Access Denied'
        : 'Something went wrong')

  const displayTitle = title ?? t(`errorPage.${lookupKey}.title`, defaultTitle)

  // Localized Descriptions
  const defaultDesc = isKhmer
    ? (codeKey === '404' || codeKey === 'unknown'
        ? "ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ប្តូរទីតាំង។ សូមសាកល្បងស្វែងរកឡើងវិញ ឬត្រឡប់ទៅកាន់ផ្ទាំងគ្រប់គ្រងដើម។"
        : "ផ្នែកនេះបានជួបប្រទះបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀត ឬត្រឡប់ទៅកាន់ផ្ទាំងគ្រប់គ្រងដើម។")
    : (codeKey === '404' || codeKey === 'unknown'
        ? "The page you're looking for doesn't exist or may have been moved. Try searching, or head back to the dashboard."
        : "An unexpected error occurred. Please try again or head back to the dashboard.")

  const displayDesc = description ?? subtitle ?? t(`errorPage.${lookupKey}.description`, defaultDesc)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden select-none",
        fullPage ? "fixed inset-0 z-50 h-screen w-screen p-6" : "min-h-[520px] w-full py-16 px-6"
      )}
    >
      {/* ── Background Ambient Radial Glow ─────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-sky-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* ── Main Centered Apex Shadcn Error Container ──────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto w-full">
        {/* Top Emerald Compass Badge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(16,185,129,0.45)] mb-6 sm:mb-8 transition-transform hover:scale-105 duration-200">
          {getBadgeIcon()}
        </div>

        {/* Giant Gradient Code (404, 500, etc.) */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 bg-clip-text text-transparent select-none mb-3 sm:mb-4">
          {displayCode}
        </h1>

        {/* Heading Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
          {displayTitle}
        </h2>

        {/* Subtitle / Description */}
        <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-7 sm:mb-8">
          {displayDesc}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {showHomeButton && (
            <button
              type="button"
              onClick={() => {
                if (onRetry) onRetry()
                navigate('/dashboard')
              }}
              className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>{t('errorPage.backToDashboard', 'Back to Dashboard')}</span>
            </button>
          )}

          {showRetryButton || onRetry ? (
            <button
              type="button"
              onClick={() => {
                if (onRetry) {
                  onRetry()
                } else {
                  window.location.reload()
                }
              }}
              className="h-10 px-5 rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.98] text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCw size={15} />
              <span>{t('errorPage.tryAgain', 'Try Again')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigate('/dashboard')
              }}
              className="h-10 px-5 rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.98] text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Search size={15} />
              <span>{t('errorPage.searchDocs', 'Search the docs')}</span>
            </button>
          )}

          {extraActions}
        </div>

        {/* Collapsible Error Debug Details (shown if error exists) */}
        {error && (
          <div className="mt-8 w-full text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              <span>{t('errorPage.technicalDetails', 'Technical Details')}</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDetails && (
              <div className="mt-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 max-h-48 overflow-y-auto text-xs font-mono text-rose-600 dark:text-rose-400">
                <div className="font-bold mb-1">{error.name}: {error.message}</div>
                {error.stack && <pre className="whitespace-pre-wrap text-[11px] text-slate-600 dark:text-slate-400">{error.stack}</pre>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HttpErrorPage
