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
  availableCampuses: Campus[]
  setActiveCampus: (campus: Campus) => void
  setAvailableCampuses: (campuses: Campus[]) => void
}

const defaultCampuses: Campus[] = [
  {
    id: "1",
    name: "Grace City - Main Campus",
    slug: "main-campus",
    type: "main",
    city: "Atlanta",
    isMainCampus: true,
  },
  {
    id: "2",
    name: "Grace City - North Campus",
    slug: "north-campus",
    type: "regional",
    city: "Alpharetta",
    isMainCampus: false,
  },
  {
    id: "3",
    name: "Grace City - Online Global",
    slug: "online-global",
    type: "online",
    city: "Digital Hub",
    isMainCampus: false,
  },
]

export const useBranchStore = create<BranchState>((set) => ({
  activeCampus: defaultCampuses[0],
  availableCampuses: defaultCampuses,
  setActiveCampus: (campus) => set({ activeCampus: campus }),
  setAvailableCampuses: (campuses) => set({ availableCampuses: campuses }),
}))
