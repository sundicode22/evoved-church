import { create } from "zustand"

interface KanbanState {
  searchQuery: string
  selectedLeadId: string | null
  isDrawerOpen: boolean
  activeView: "board" | "list"
  setSearchQuery: (query: string) => void
  setSelectedLeadId: (id: string | null) => void
  setIsDrawerOpen: (isOpen: boolean) => void
  setActiveView: (view: "board" | "list") => void
  openLeadDrawer: (id: string) => void
  closeLeadDrawer: () => void
}

export const useKanbanStore = create<KanbanState>((set) => ({
  searchQuery: "",
  selectedLeadId: null,
  isDrawerOpen: false,
  activeView: "board",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedLeadId: (selectedLeadId) => set({ selectedLeadId }),
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
  setActiveView: (activeView) => set({ activeView }),
  openLeadDrawer: (id) => set({ selectedLeadId: id, isDrawerOpen: true }),
  closeLeadDrawer: () => set({ isDrawerOpen: false }),
}))
