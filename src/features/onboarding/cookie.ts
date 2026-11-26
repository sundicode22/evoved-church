/** Client + middleware: gates /dashboard until onboarding is done. */
export const ONBOARDING_COOKIE = "evolve_onboarding_completed"

export function setOnboardingCompletedCookie() {
  if (typeof document === "undefined") return
  document.cookie = `${ONBOARDING_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}
