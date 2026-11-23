/**
 * Domain & Application Error Hierarchy for Evolve ChMS
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details?: unknown) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const msg = id ? `${resource} with ID '${id}' was not found.` : `${resource} was not found.`
    super(msg, 404, "NOT_FOUND")
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required. Please sign in.") {
    super(message, 401, "UNAUTHORIZED")
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403, "FORBIDDEN")
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT")
  }
}

/**
 * Church Accounting Specific Error:
 * Raised when an expense requisition exceeds the department or fund's unencumbered balance.
 */
export class BudgetExceededError extends AppError {
  public readonly requestedAmount: number
  public readonly availableBalance: number
  public readonly fundName: string

  constructor(fundName: string, requestedAmount: number, availableBalance: number) {
    super(
      `Requisition for $${requestedAmount.toFixed(2)} exceeds available unencumbered balance of $${availableBalance.toFixed(2)} in fund '${fundName}'.`,
      400,
      "BUDGET_EXCEEDED",
      { fundName, requestedAmount, availableBalance }
    )
    this.fundName = fundName
    this.requestedAmount = requestedAmount
    this.availableBalance = availableBalance
  }
}

export interface StandardErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    timestamp: string
  }
}

export function formatErrorResponse(error: unknown): { status: number; body: StandardErrorResponse } {
  const timestamp = new Date().toISOString()

  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp,
        },
      },
    }
  }

  // Handle unexpected errors safely
  const message = error instanceof Error ? error.message : "An unexpected server error occurred."
  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
        timestamp,
      },
    },
  }
}
