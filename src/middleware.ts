import { NextResponse, type NextRequest } from "next/server"

const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"]

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      ({ name, value }) =>
        value !== "" && (name.includes("better-auth") || name.includes("session_token"))
    )
}

export function middleware(request: NextRequest) {
  // Local scaffolding / demo: skip gate when auth is not configured
  if (process.env.AUTH_DISABLED === "true" || !process.env.BETTER_AUTH_SECRET) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (isProtected && !hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
}
