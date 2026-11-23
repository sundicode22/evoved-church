import { create } from "zustand"

interface KanbanState {
  searchQuery: string
  selectedDealId: string | null
  isDrawerOpen: boolean
  activeView: "pipeline" | "list"
  setSearchQuery: (query: string) => void
  setSelectedDealId: (id: string | null) => void
  setIsDrawerOpen: (isOpen: boolean) => void
  setActiveView: (view: "pipeline" | "list") => void
  openDealDrawer: (id: string) => void
  closeDealDrawer: () => void
}

export const useKanbanStore = create<KanbanState>((set) => ({
  searchQuery: "",
  selectedDealId: "deal-10",
  isDrawerOpen: false,
  activeView: "pipeline",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedDealId: (selectedDealId) => set({ selectedDealId }),
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
  setActiveView: (activeView) => set({ activeView }),
  openDealDrawer: (id) => set({ selectedDealId: id, isDrawerOpen: true }),
  closeDealDrawer: () => set({ isDrawerOpen: false }),
}))
