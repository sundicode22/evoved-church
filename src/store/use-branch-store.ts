import { create } from "zustand"

export interface Campus {
  id: string
  name: string
  slug: string
  type: "main" | "regional" | "satellite" | "church_plant" | "online"
  city: string
  isMainCampus: boolean
}

interface BranchState {
  activeCampus: Campus
  activeCampusId: string
  availableCampuses: Campus[]
  setActiveCampus: (campus: Campus) => void
  setAvailableCampuses: (campuses: Campus[]) => void
}

const emptyCampus: Campus = {
  id: "",
  name: "",
  slug: "",
  type: "main",
  city: "",
  isMainCampus: true,
}

export const useBranchStore = create<BranchState>((set) => ({
  activeCampus: emptyCampus,
  activeCampusId: "",
  availableCampuses: [],
  setActiveCampus: (campus) => set({ activeCampus: campus, activeCampusId: campus.id }),
  setAvailableCampuses: (campuses) =>
    set((state) => {
      const nextActive =
        campuses.find((c) => c.id === state.activeCampusId) || campuses[0] || emptyCampus
      return {
        availableCampuses: campuses,
        activeCampus: nextActive,
        activeCampusId: nextActive.id,
      }
    }),
}))
