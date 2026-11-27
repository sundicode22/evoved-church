import { cn } from "@/lib/utils"

/** Same light look as the original auth card — shadow-xs only. */
export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-border/60 bg-card p-6 shadow-xs",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AuthCardHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-5 space-y-1 text-center">
      <h1 className="text-2xl font-medium tracking-tight text-foreground">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
