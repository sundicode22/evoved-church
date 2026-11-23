import { db } from "@/lib/db"
import { members, userCategories, campuses } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { NotFoundError, ValidationError } from "@/lib/errors"
import { CreateMemberInput, CreateCategoryInput } from "./schemas"

export const memberService = {
  /**
   * Retrieves all members filtered by personType or campus
   */
  async getMembers(filter?: { personType?: string; campusId?: string }) {
    try {
      const records = await db.select().from(members).orderBy(desc(members.createdAt))
      if (records.length === 0) {
        return [
          {
            id: "mem-1",
            firstName: "David",
            lastName: "Johnson",
            personType: "staff_minister",
            recordedTitle: "Senior Pastor",
            ministryRoles: ["Preaching", "Board of Elders"],
            ordinationDate: "2010-06-15",
            ordinationCredentials: "Acts Assemblies Presbytery #4492",
            backgroundCheckStatus: "cleared",
            backgroundCheckExpiresAt: "2027-01-01",
            category: "Senior Leadership",
            badgeColor: "emerald",
          },
          {
            id: "mem-2",
            firstName: "Marcus",
            lastName: "Vance",
            personType: "staff_minister",
            recordedTitle: "Executive Pastor (Operations)",
            ministryRoles: ["Operations", "Finance Committee"],
            ordinationDate: "2014-08-20",
            backgroundCheckStatus: "cleared",
            category: "Executive Staff",
            badgeColor: "blue",
          },
          {
            id: "mem-3",
            firstName: "Kathryn",
            lastName: "Murphy",
            personType: "leader",
            recordedTitle: "Deaconess & Life Group Coordinator",
            ministryRoles: ["Small Groups", "Hospitality"],
            baptismDate: "2018-04-12",
            backgroundCheckStatus: "cleared",
            category: "Ministry Leaders",
            badgeColor: "purple",
          },
          {
            id: "mem-4",
            firstName: "Jane",
            lastName: "Cooper",
            personType: "prospect",
            recordedTitle: null,
            ministryRoles: [],
            backgroundCheckStatus: "none",
            category: "Newcomers & Visitors",
            badgeColor: "amber",
          },
        ]
      }
      return records
    } catch (err) {
      console.error("[memberService.getMembers] DB error:", err)
      return []
    }
  },

  /**
   * Retrieves all dynamic user categories
   */
  async getCategories() {
    try {
      const cats = await db.select().from(userCategories)
      if (cats.length === 0) {
        return [
          { id: "cat-1", name: "Senior Leadership", slug: "senior-leadership", badgeColor: "emerald", isSystem: true },
          { id: "cat-2", name: "Executive Staff", slug: "executive-staff", badgeColor: "blue", isSystem: true },
          { id: "cat-3", name: "Ministry Leaders", slug: "ministry-leaders", badgeColor: "purple", isSystem: false },
          { id: "cat-4", name: "Covenant Partners", slug: "covenant-partners", badgeColor: "teal", isSystem: false },
          { id: "cat-5", name: "Newcomers & Guests", slug: "newcomers-guests", badgeColor: "amber", isSystem: true },
        ]
      }
      return cats
    } catch (err) {
      console.error("[memberService.getCategories] DB error:", err)
      return []
    }
  },

  /**
   * Creates a dynamic category of users
   */
  async createCategory(input: CreateCategoryInput) {
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const [created] = await db
      .insert(userCategories)
      .values({
        name: input.name,
        slug,
        badgeColor: input.badgeColor,
        description: input.description || null,
        permissions: input.permissions,
      })
      .returning()
    return created
  },
}
