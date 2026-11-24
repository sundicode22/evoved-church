import {
  importGivingBodySchema,
  importMembersBodySchema,
  type ImportGivingBody,
  type ImportMembersBody,
} from "./schemas"

export type ImportRowError = { row: number; message: string }

export type ImportReport = {
  mode: "dry_run" | "apply"
  total: number
  valid: number
  imported: number
  errors: ImportRowError[]
  sample: Record<string, unknown>[]
}

/** In-memory imported rows for demo (no DB write required for first release). */
const importedMembers: Record<string, unknown>[] = []
const importedGiving: Record<string, unknown>[] = []

export const importService = {
  async importMembers(input: ImportMembersBody): Promise<ImportReport> {
    const parsed = importMembersBodySchema.parse(input)
    const errors: ImportRowError[] = []
    const validRows: Record<string, unknown>[] = []

    parsed.rows.forEach((row, i) => {
      if (!row.firstName?.trim() || !row.lastName?.trim()) {
        errors.push({ row: i + 1, message: "firstName and lastName are required" })
        return
      }
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push({ row: i + 1, message: `Invalid email: ${row.email}` })
        return
      }
      validRows.push({ ...row, _row: i + 1 })
    })

    if (parsed.mode === "apply") {
      importedMembers.push(...validRows)
    }

    return {
      mode: parsed.mode,
      total: parsed.rows.length,
      valid: validRows.length,
      imported: parsed.mode === "apply" ? validRows.length : 0,
      errors,
      sample: validRows.slice(0, 5),
    }
  },

  async importGiving(input: ImportGivingBody): Promise<ImportReport> {
    const parsed = importGivingBodySchema.parse(input)
    const errors: ImportRowError[] = []
    const validRows: Record<string, unknown>[] = []

    parsed.rows.forEach((row, i) => {
      if (!row.amount || row.amount <= 0) {
        errors.push({ row: i + 1, message: "amount must be positive" })
        return
      }
      if (!row.contributionDate) {
        errors.push({ row: i + 1, message: "contributionDate is required" })
        return
      }
      if (!row.email && !row.memberName) {
        errors.push({ row: i + 1, message: "email or memberName required" })
        return
      }
      validRows.push({ ...row, _row: i + 1 })
    })

    if (parsed.mode === "apply") {
      importedGiving.push(...validRows)
    }

    return {
      mode: parsed.mode,
      total: parsed.rows.length,
      valid: validRows.length,
      imported: parsed.mode === "apply" ? validRows.length : 0,
      errors,
      sample: validRows.slice(0, 5),
    }
  },

  getImportedCounts() {
    return {
      members: importedMembers.length,
      giving: importedGiving.length,
    }
  },
}
