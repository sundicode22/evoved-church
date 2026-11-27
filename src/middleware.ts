import { NextResponse, type NextRequest } from "next/server"
import { ONBOARDING_COOKIE } from "@/features/onboarding/cookie"

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
  const hasSession = hasSessionCookie(request)
  const onboardingDone = request.cookies.get(ONBOARDING_COOKIE)?.value === "1"

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && pathname.startsWith("/dashboard") && !onboardingDone) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  if (hasSession && pathname.startsWith("/onboarding") && onboardingDone) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // `/dashboard/:path*` does not match `/dashboard` itself.
  matcher: ["/dashboard", "/dashboard/:path*", "/onboarding", "/onboarding/:path*"],
}
