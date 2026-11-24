import type { UpdateNomenclatureInput } from "@/features/settings/schemas"

export type NomenclaturePresetKey = "baptist" | "anglican" | "nondenom"

export interface NomenclaturePreset {
  key: NomenclaturePresetKey
  label: string
  description: string
  terms: Required<
    Pick<
      UpdateNomenclatureInput,
      | "memberTermSingular"
      | "memberTermPlural"
      | "visitorTermSingular"
      | "visitorTermPlural"
      | "groupTermSingular"
      | "groupTermPlural"
      | "campusTermSingular"
      | "campusTermPlural"
      | "pastorTermSingular"
      | "givingTerm"
    >
  >
}

export const NOMENCLATURE_PRESETS: NomenclaturePreset[] = [
  {
    key: "baptist",
    label: "Baptist",
    description: "Members, Pastors, Tithes & Offerings",
    terms: {
      memberTermSingular: "Member",
      memberTermPlural: "Members",
      visitorTermSingular: "Visitor",
      visitorTermPlural: "Visitors",
      groupTermSingular: "Sunday School Class",
      groupTermPlural: "Sunday School Classes",
      campusTermSingular: "Location",
      campusTermPlural: "Locations",
      pastorTermSingular: "Pastor",
      givingTerm: "Tithes & Offerings",
    },
  },
  {
    key: "anglican",
    label: "Anglican",
    description: "Parishioners, Parishes, Stewardship",
    terms: {
      memberTermSingular: "Parishioner",
      memberTermPlural: "Parishioners",
      visitorTermSingular: "Newcomer",
      visitorTermPlural: "Newcomers",
      groupTermSingular: "Fellowship",
      groupTermPlural: "Fellowships",
      campusTermSingular: "Parish",
      campusTermPlural: "Parishes",
      pastorTermSingular: "Priest",
      givingTerm: "Stewardship",
    },
  },
  {
    key: "nondenom",
    label: "Non-denominational",
    description: "Partners, Life Groups, Giving",
    terms: {
      memberTermSingular: "Partner",
      memberTermPlural: "Partners",
      visitorTermSingular: "First-Time Guest",
      visitorTermPlural: "First-Time Guests",
      groupTermSingular: "Life Group",
      groupTermPlural: "Life Groups",
      campusTermSingular: "Location",
      campusTermPlural: "Locations",
      pastorTermSingular: "Pastor",
      givingTerm: "Giving",
    },
  },
]

export const DENOMINATIONS = [
  "Baptist",
  "Anglican / Episcopal",
  "Pentecostal",
  "Methodist",
  "Presbyterian",
  "Catholic",
  "Lutheran",
  "Non-denominational",
  "Other",
] as const

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
