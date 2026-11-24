import { create } from "zustand"

export interface NomenclatureSettings {
  churchName: string
  memberTermSingular: string // "Member", "Partner", "Parishioner", "Covenant Member"
  memberTermPlural: string   // "Members", "Partners", "Parishioners"
  visitorTermSingular: string // "First-Time Guest", "Newcomer", "Visitor"
  visitorTermPlural: string
  groupTermSingular: string   // "Small Group", "Life Group", "Cell", "Connect Group"
  groupTermPlural: string
  campusTermSingular: string  // "Campus", "Branch", "Parish", "Assembly"
  campusTermPlural: string
  pastorTermSingular: string  // "Pastor", "Minister", "Priest", "Elder"
  givingTerm: string          // "Tithes & Offerings", "Stewardship", "First Fruits"
  currencyCode: string        // "USD", "EUR", "GBP", "CAD", "AUD", "NGN"
}

interface NomenclatureStore {
  nomenclature: NomenclatureSettings
  updateNomenclature: (updates: Partial<NomenclatureSettings>) => void
  resetToDefaults: () => void
}

const defaultNomenclature: NomenclatureSettings = {
  churchName: "Evolve Church",
  memberTermSingular: "Member",
  memberTermPlural: "Members",
  visitorTermSingular: "First-Time Guest",
  visitorTermPlural: "First-Time Guests",
  groupTermSingular: "Small Group",
  groupTermPlural: "Small Groups",
  campusTermSingular: "Location",
  campusTermPlural: "Locations",
  pastorTermSingular: "Pastor",
  givingTerm: "Tithes & Offerings",
  currencyCode: "USD",
}

export const useNomenclatureStore = create<NomenclatureStore>((set) => ({
  nomenclature: defaultNomenclature,
  updateNomenclature: (updates) =>
    set((state) => ({
      nomenclature: { ...state.nomenclature, ...updates },
    })),
  resetToDefaults: () => set({ nomenclature: defaultNomenclature }),
}))
