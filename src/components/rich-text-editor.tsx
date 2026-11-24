"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "cn"
import {
  Bold as BoldIcon,
  Heading2,
  ImageIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote as QuoteIcon,
} from "lucide-react"

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  disabled?: boolean
  /** Enable image insert (URL). Default true for blog / portal content. */
  enableImages?: boolean
}

/**
 * TipTap editor — headings, lists, links, optional images.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content…",
  className,
  minHeight = "220px",
  disabled = false,
  enableImages = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[var(--brand-hover)] underline" },
      }),
      ...(enableImages
        ? [
            Image.configure({
              HTMLAttributes: {
                class:
                  "my-4 max-h-[420px] w-full rounded-xl border border-zinc-200/80 object-cover shadow-xs",
              },
            }),
          ]
        : []),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-4 py-3 text-sm text-zinc-800 outline-none focus:outline-none",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-[var(--brand)]/40 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-600",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_img]:rounded-xl"
        ),
        style: `min-height:${minHeight}`,
      },
    },
  })

  React.useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor])

  React.useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-xl border border-zinc-200/80 bg-white px-4 py-8 text-xs text-zinc-400",
          className
        )}
      >
        Loading editor…
      </div>
    )
  }

  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL", prev || "https://")
    if (url === null) return
    if (url === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  function addImage() {
    const url = window.prompt("Image URL", "https://")
    if (!url) return
    editor!.chain().focus().setImage({ src: url }).run()
  }

  const tools = [
    {
      label: "Bold",
      icon: BoldIcon,
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: ItalicIcon,
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Heading",
      icon: Heading2,
      active: editor.isActive("heading", { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Bullets",
      icon: List,
      active: editor.isActive("bulletList"),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered",
      icon: ListOrdered,
      active: editor.isActive("orderedList"),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: QuoteIcon,
      active: editor.isActive("blockquote"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Link",
      icon: LinkIcon,
      active: editor.isActive("link"),
      action: setLink,
    },
    ...(enableImages
      ? [
          {
            label: "Image",
            icon: ImageIcon,
            active: false,
            action: addImage,
          },
        ]
      : []),
  ]

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs",
        disabled && "opacity-60",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-100 bg-[#f8faf9] px-2 py-1.5">
        {tools.map((t, i) => (
          <React.Fragment key={t.label}>
            {(i === 3 || i === 6) && (
              <Separator orientation="vertical" className="mx-1 h-5" />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              title={t.label}
              className={cn(
                "size-7 text-zinc-600",
                t.active && "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                t.action()
              }}
            >
              <t.icon className="size-3.5" />
            </Button>
          </React.Fragment>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
