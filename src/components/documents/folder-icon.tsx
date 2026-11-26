import { cn } from "cn"

/** Realistic folder illustration for the documents vault. */
export function FolderIcon({
  className,
  open = false,
}: {
  className?: string
  open?: boolean
}) {
  return (
    <svg
      viewBox="0 0 96 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-16 drop-shadow-sm", className)}
      aria-hidden
    >
      <path
        d="M8 18c0-3.314 2.686-6 6-6h22.5c1.6 0 3.1.7 4.1 1.9l4.2 5.1c1 1.2 2.5 1.9 4.1 1.9H82c3.314 0 6 2.686 6 6v40c0 3.314-2.686 6-6 6H14c-3.314 0-6-2.686-6-6V18Z"
        fill="#F4C15D"
      />
      <path
        d="M8 28h80v36c0 3.314-2.686 6-6 6H14c-3.314 0-6-2.686-6-6V28Z"
        fill="#E8A93A"
      />
      {open ? (
        <path
          d="M10 34c0-2.2 1.8-4 4-4h68c2.2 0 4 1.8 4 4v4H10v-4Z"
          fill="#F8D98A"
        />
      ) : (
        <path
          d="M14 34h68c2.2 0 4 1.8 4 4v26c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V38c0-2.2 1.8-4 4-4Z"
          fill="#F0B84A"
        />
      )}
      <path
        d="M8 18c0-3.314 2.686-6 6-6h22.5c1.6 0 3.1.7 4.1 1.9l4.2 5.1c1 1.2 2.5 1.9 4.1 1.9H82c3.314 0 6 2.686 6 6v4H8v-4Z"
        fill="#F7CB74"
      />
    </svg>
  )
}
