import { SQL, sql } from "drizzle-orm"
import { PgSelect } from "drizzle-orm/pg-core"

export interface DbPaginationParams {
  page?: number
  pageSize?: number
}

export interface DbPaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Executes a true SQL-level paginated query with limit, offset, and count
 */
export async function withDbPagination<T>(
  query: PgSelect,
  countQuery: PgSelect,
  params: DbPaginationParams = {}
): Promise<DbPaginationResult<T>> {
  const page = Math.max(1, Number(params.page || 1))
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize || 10)))
  const offset = (page - 1) * pageSize

  // Execute count and paginated query in parallel
  const [totalResult, dataResult] = await Promise.all([
    countQuery,
    query.limit(pageSize).offset(offset),
  ])

  const total = Number((totalResult as any)[0]?.count || 0)
  const totalPages = Math.ceil(total / pageSize) || 1

  return {
    data: dataResult as T[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}
