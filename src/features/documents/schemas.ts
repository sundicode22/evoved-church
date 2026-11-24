import { z } from "zod"

export const documentRoles = [
  "public",
  "member",
  "volunteer",
  "ministry_staff",
  "finance_committee",
  "elder",
] as const

export type DocumentRole = (typeof documentRoles)[number]

export const createFolderSchema = z.object({
  name: z.string().trim().min(2, "Folder name must be at least 2 characters").max(255),
  parentId: z.string().min(1).nullable().optional(),
  minRoleRequired: z.enum(documentRoles).default("member"),
  campusId: z.string().min(1).nullable().optional(),
})

export const createDocumentSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(255),
  folderId: z.string().min(1).nullable().optional(),
  campusId: z.string().min(1).nullable().optional(),
  cloudinaryPublicId: z.string().min(1),
  cloudinaryUrl: z.string().url(),
  format: z.string().max(20).optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  minRoleRequired: z.enum(documentRoles).default("member"),
})

export const signUploadSchema = z.object({
  folder: z.string().trim().min(1).max(255).optional(),
  filename: z.string().trim().min(1).max(255).optional(),
  resourceType: z.enum(["image", "video", "raw", "auto"]).default("auto"),
})

export type CreateFolderInput = z.infer<typeof createFolderSchema>
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type SignUploadInput = z.infer<typeof signUploadSchema>

export interface DocumentFolderDto {
  id: string
  name: string
  parentId: string | null
  minRoleRequired: DocumentRole | string
  itemCount: number
  createdAt: string
}

export interface ChurchDocumentDto {
  id: string
  folderId: string | null
  title: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  format: string | null
  fileSizeBytes: number | null
  minRoleRequired: DocumentRole | string
  uploadedBy: string
  createdAt: string
}
