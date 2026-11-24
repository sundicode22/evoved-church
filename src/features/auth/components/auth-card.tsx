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
        "w-full rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-xs",
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
      <h1 className="text-2xl font-medium tracking-tight text-slate-900">{title}</h1>
      {description ? (
        <p className="text-sm text-zinc-500">{description}</p>
      ) : null}
    </div>
  )
}
