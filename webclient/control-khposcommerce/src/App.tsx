import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import ToastContainer from '@/components/ui/ToastContainer'
import ThemeSynchronizer from '@/components/shared/ThemeSynchronizer'
import NetworkStatusListener from '@/components/shared/NetworkStatusListener'
import MuiAppProvider from '@/components/shared/MuiAppProvider'
import DashboardTransitionOverlay from '@/components/shared/DashboardTransitionOverlay'
import TopProgressBar from '@/components/shared/TopProgressBar'
import { useAuthStore } from '@/stores/authStore'
import { ErrorBoundary } from '@/components/common'
import { AppRoutes } from '@/routes'

// ─── Query Client ────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// ─── Platform App Component ──────────────────────────────────────────────────

export const App: React.FC = () => {
  const isDashboardTransitioning = useAuthStore((s) => s.isDashboardTransitioning)
  const transitionMessage = useAuthStore((s) => s.transitionMessage)
  const transitionSubMessage = useAuthStore((s) => s.transitionSubMessage)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSynchronizer />
      <MuiAppProvider>
        <BrowserRouter>
          <div className="h-full bg-background text-foreground antialiased selection:bg-indigo-500 selection:text-white">
            <TopProgressBar />
            <NetworkStatusListener />
            <ToastContainer />
            <AnimatePresence mode="wait">
              {isDashboardTransitioning && (
                <DashboardTransitionOverlay
                  message={transitionMessage}
                  subMessage={transitionSubMessage}
                />
              )}
            </AnimatePresence>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </div>
        </BrowserRouter>
      </MuiAppProvider>
    </QueryClientProvider>
  )
}

export default App
