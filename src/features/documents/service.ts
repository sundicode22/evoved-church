import { randomUUID, createHash } from "node:crypto"
import { db } from "@/lib/db"
import { documentFolders, churchDocuments } from "@/lib/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import type {
  ChurchDocumentDto,
  CreateDocumentInput,
  CreateFolderInput,
  DocumentFolderDto,
  SignUploadInput,
} from "./schemas"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "evolve-church-demo"

const iso = (d: Date | string) => (d instanceof Date ? d.toISOString() : d)

const demoFolders: DocumentFolderDto[] = []
const demoDocuments: ChurchDocumentDto[] = []

// Records created while running without a database.
const memoryFolders: DocumentFolderDto[] = []
const memoryDocuments: ChurchDocumentDto[] = []

export const documentsService = {
  async listFolders(campusId?: string): Promise<DocumentFolderDto[]> {
    try {
      const rows = await db
        .select({
          id: documentFolders.id,
          name: documentFolders.name,
          parentId: documentFolders.parentId,
          minRoleRequired: documentFolders.minRoleRequired,
          createdAt: documentFolders.createdAt,
          itemCount: sql<number>`(select count(*)::int from ${churchDocuments} where ${churchDocuments.folderId} = ${documentFolders.id})`,
        })
        .from(documentFolders)
        .where(campusId && UUID_RE.test(campusId) ? eq(documentFolders.campusId, campusId) : undefined)
        .orderBy(documentFolders.name)

      if (rows.length > 0) {
        return rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) }))
      }
    } catch {
      /* demo fallback */
    }
    return [...memoryFolders, ...demoFolders]
  },

  async createFolder(input: CreateFolderInput): Promise<DocumentFolderDto> {
    try {
      const [row] = await db
        .insert(documentFolders)
        .values({
          name: input.name,
          parentId: input.parentId && UUID_RE.test(input.parentId) ? input.parentId : null,
          campusId: input.campusId && UUID_RE.test(input.campusId) ? input.campusId : null,
          minRoleRequired: input.minRoleRequired,
        })
        .returning()
      if (row) {
        return {
          id: row.id,
          name: row.name,
          parentId: row.parentId,
          minRoleRequired: row.minRoleRequired,
          itemCount: 0,
          createdAt: iso(row.createdAt),
        }
      }
    } catch {
      /* demo fallback */
    }
    const folder: DocumentFolderDto = {
      id: `fld-${randomUUID()}`,
      name: input.name,
      parentId: input.parentId ?? null,
      minRoleRequired: input.minRoleRequired,
      itemCount: 0,
      createdAt: new Date().toISOString(),
    }
    memoryFolders.unshift(folder)
    return folder
  },

  async listDocuments(folderId?: string, campusId?: string): Promise<ChurchDocumentDto[]> {
    try {
      const rows = await db
        .select()
        .from(churchDocuments)
        .where(folderId && UUID_RE.test(folderId) ? eq(churchDocuments.folderId, folderId) : undefined)
        .orderBy(desc(churchDocuments.createdAt))
      if (rows.length > 0) {
        return rows
          .filter((r) => !campusId || !UUID_RE.test(campusId) || !r.campusId || r.campusId === campusId)
          .map((r) => ({
            id: r.id,
            folderId: r.folderId,
            title: r.title,
            cloudinaryPublicId: r.cloudinaryPublicId,
            cloudinaryUrl: r.cloudinaryUrl,
            format: r.format,
            fileSizeBytes: r.fileSizeBytes,
            minRoleRequired: r.minRoleRequired,
            uploadedBy: r.uploadedByUserId,
            createdAt: iso(r.createdAt),
          }))
      }
    } catch {
      /* demo fallback */
    }
    const all = [...memoryDocuments, ...demoDocuments]
    return folderId ? all.filter((d) => d.folderId === folderId) : all
  },

  /** Stores upload metadata after the browser has uploaded the file to Cloudinary. */
  async createDocument(input: CreateDocumentInput): Promise<ChurchDocumentDto> {
    // Persisting requires an authenticated uploader id; until auth is wired in
    // we keep the record in memory so the vault UI stays interactive.
    const doc: ChurchDocumentDto = {
      id: `doc-${randomUUID()}`,
      folderId: input.folderId ?? null,
      title: input.title,
      cloudinaryPublicId: input.cloudinaryPublicId,
      cloudinaryUrl: input.cloudinaryUrl,
      format: input.format ?? null,
      fileSizeBytes: input.fileSizeBytes ?? null,
      minRoleRequired: input.minRoleRequired,
      uploadedBy: "You",
      createdAt: new Date().toISOString(),
    }
    memoryDocuments.unshift(doc)
    return doc
  },

  /**
   * Returns the parameters a client needs for a signed Cloudinary upload.
   * Uses the real signature when CLOUDINARY_API_SECRET is set, otherwise a stub.
   */
  async signUpload(input: SignUploadInput) {
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = input.folder || "evolve-church/documents"
    const publicId = `${folder}/${Date.now()}-${(input.filename || "upload").replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const apiKey = process.env.CLOUDINARY_API_KEY || "demo-api-key"
    const secret = process.env.CLOUDINARY_API_SECRET
    const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`
    const signature = secret
      ? createHash("sha1").update(toSign + secret).digest("hex")
      : `stub_${createHash("sha1").update(toSign).digest("hex").slice(0, 24)}`

    return {
      stub: !secret,
      cloudName: CLOUD_NAME,
      apiKey,
      timestamp,
      folder,
      publicId,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${input.resourceType}/upload`,
      secureUrl: `https://res.cloudinary.com/${CLOUD_NAME}/${input.resourceType === "auto" ? "raw" : input.resourceType}/upload/${publicId}`,
    }
  },
}
