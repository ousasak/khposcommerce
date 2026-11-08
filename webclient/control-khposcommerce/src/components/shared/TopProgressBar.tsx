import React, { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigationProgressStore } from '@/stores/navigationProgressStore'

interface TopProgressBarProps {
  color?: string
  glowColor?: string
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({
  color = 'from-blue-500 via-sky-400 to-blue-600',
  glowColor = 'rgba(37, 99, 235, 0.9)',
}) => {
  const location = useLocation()
  const isPending = useNavigationProgressStore((s) => s.isPending)

  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const isFirstRender = useRef(true)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t))
    timeoutsRef.current = []
  }

  const completeAndFadeOut = () => {
    setProgress(100)
    const t1 = setTimeout(() => {
      setVisible(false)
      const t2 = setTimeout(() => {
        setProgress(0)
      }, 300)
      timeoutsRef.current.push(t2)
    }, 200)
    timeoutsRef.current.push(t1)
  }

  // ── Trigger when user clicks any menu link / route changes ──
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    clearAllTimeouts()
    setVisible(true)
    setProgress(28)

    // Stage 1: Quick burst to 65%
    const t1 = setTimeout(() => {
      setProgress(65)
    }, 90)
    timeoutsRef.current.push(t1)

    // Stage 2: Smooth advance to 85%
    const t2 = setTimeout(() => {
      setProgress(85)
    }, 190)
    timeoutsRef.current.push(t2)

    // Stage 3: If route chunk is already cached/fast, complete smoothly
    const t3 = setTimeout(() => {
      const currentlyPending = useNavigationProgressStore.getState().isPending
      if (!currentlyPending) {
        completeAndFadeOut()
      }
    }, 320)
    timeoutsRef.current.push(t3)

    return () => clearAllTimeouts()
  }, [location.pathname, location.search])

  // ── Complete when Suspense finishes loading lazy chunk ──
  useEffect(() => {
    if (!visible) return

    if (!isPending && progress >= 85) {
      completeAndFadeOut()
    }
  }, [isPending])

  if (!visible && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] sm:h-[3px] z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className={`h-full bg-gradient-to-r ${color} transition-all duration-200 ease-out relative`}
        style={{
          width: `${progress}%`,
          boxShadow: `0 0 10px ${glowColor}, 0 0 4px ${glowColor}`,
        }}
      >
        {/* Leading edge glowing peg (YouTube / GitHub / NProgress style) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-white/70"
          style={{
            boxShadow: `0 0 14px ${glowColor}, 0 0 6px ${glowColor}`,
          }}
        />
      </div>
    </div>
  )
}

export default TopProgressBar

