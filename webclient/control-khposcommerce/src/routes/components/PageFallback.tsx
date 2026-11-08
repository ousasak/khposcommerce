import React, { useEffect } from 'react'
import { useNavigationProgressStore } from '@/stores/navigationProgressStore'

export const PageFallback: React.FC = () => {
  const startProgress = useNavigationProgressStore((s) => s.startProgress)
  const finishProgress = useNavigationProgressStore((s) => s.finishProgress)

  useEffect(() => {
    startProgress()
    return () => {
      finishProgress()
    }
  }, [startProgress, finishProgress])

  return (
    <div className="w-full p-6 space-y-6 animate-pulse opacity-40 select-none pointer-events-none">
      {/* Subtle page header skeleton */}
      <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
      {/* Subtle metric cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
      {/* Content table placeholder */}
      <div className="h-72 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
    </div>
  )
}

export default PageFallback
