import { create } from 'zustand'

interface NavigationProgressState {
  isPending: boolean
  startProgress: () => void
  finishProgress: () => void
}

export const useNavigationProgressStore = create<NavigationProgressState>((set) => ({
  isPending: false,
  startProgress: () => set({ isPending: true }),
  finishProgress: () => set({ isPending: false }),
}))

