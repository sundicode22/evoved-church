import { cn } from "@/lib/utils"

/** Product mark. Church-uploaded logos stay on ChurchLogo. */
export function EvolveLogo({ className }: { className?: string }) {
  return (
    <img
      src="/icon.png"
      alt=""
      width={512}
      height={512}
      className={cn("size-9 shrink-0 select-none", className)}
    />
  )
}
