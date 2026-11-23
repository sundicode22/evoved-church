import axios, { AxiosError } from "axios"
import { useBranchStore } from "@/store/use-branch-store"

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  campusId?: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  pagination?: PaginationMeta
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach active campus/branch ID automatically to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const activeCampus = useBranchStore.getState().activeCampus
        if (activeCampus?.id) {
          config.headers["x-campus-id"] = activeCampus.id
        }
      } catch (err) {
        // Fallback gracefully if store is not yet initialized
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Standardize error handling on responses
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; error?: { message?: string; code?: string } }>) => {
    const customMessage = error.response?.data?.error?.message
    const errorMessage = customMessage || error.message || "An unexpected network error occurred."
    return Promise.reject(new Error(errorMessage))
  }
)
