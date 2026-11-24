import { redirect } from "next/navigation"

/** Legacy Sunday-only route — services are multi-type now. */
export default function SundayServicesRedirect() {
  redirect("/dashboard/services")
}
