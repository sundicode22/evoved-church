import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-normal text-zinc-600 whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-zinc-200 bg-white text-zinc-600 [a]:hover:bg-zinc-50",
        secondary:
          "border-zinc-200 bg-white text-zinc-600 [a]:hover:bg-zinc-50",
        destructive:
          "border-zinc-200 bg-white text-zinc-600 [a]:hover:bg-zinc-50",
        outline:
          "border-zinc-200 bg-white text-zinc-600 [a]:hover:bg-zinc-50",
        ghost:
          "border-transparent bg-transparent text-zinc-600 hover:bg-zinc-50",
        link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
