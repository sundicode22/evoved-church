import { z } from "zod"

export const GROUP_TYPES = ["private", "public", "team"] as const
export const GROUP_MEMBER_ROLES = ["leader", "member", "guest"] as const

export const groupTypeSchema = z.enum(GROUP_TYPES)
export const groupMemberRoleSchema = z.enum(GROUP_MEMBER_ROLES)

export const createGroupSchema = z.object({
  campusId: z.string().min(1).optional(),
  name: z.string().min(2, "Group name is required"),
  type: groupTypeSchema.default("public"),
  imageUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")).nullable(),
  description: z.string().optional().nullable(),
  leaderMemberId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const updateGroupSchema = createGroupSchema.partial()

export const addMembershipSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  role: groupMemberRoleSchema.default("member"),
  memberDisplayName: z.string().optional(),
})

export type GroupType = (typeof GROUP_TYPES)[number]
export type GroupMemberRole = (typeof GROUP_MEMBER_ROLES)[number]
export type CreateGroupInput = z.input<typeof createGroupSchema>
export type UpdateGroupInput = z.input<typeof updateGroupSchema>
export type AddMembershipInput = z.input<typeof addMembershipSchema>

export interface MinistryGroup {
  id: string
  campusId: string
  name: string
  type: GroupType
  imageUrl: string | null
  description: string | null
  leaderMemberId: string | null
  leaderName: string | null
  isActive: boolean
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface GroupMembership {
  id: string
  groupId: string
  groupName?: string
  memberId: string
  memberDisplayName: string
  role: GroupMemberRole
  joinedAt: string
}

export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  private: "Private",
  public: "Public",
  team: "Team",
}
