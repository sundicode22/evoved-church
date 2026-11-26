"use client"

import * as React from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SelectFormField, TextFormField } from "@/components/form-fields"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { apiClient, type ApiResponse } from "@/lib/axios"
import { useBranchStore } from "@/store/use-branch-store"
import {
  createFolderSchema,
  documentRoles,
  type ChurchDocumentDto,
  type DocumentFolderDto,
} from "@/features/documents/schemas"
import { PageHeader } from "@/components/page-header"
import { StatusPill, TableAddButton, TablePanel } from "@/components/table-panel"
import { FolderIcon } from "@/components/documents/folder-icon"
import {
  ChevronRight,
  File as FileIcon,
  Plus,
  Search as Search,
  ShieldCheck,
  Upload as Upload,
} from "lucide-react"
import { cn } from "cn"

const ROLE_LABELS: Record<string, string> = {
  public: "Public",
  member: "Members",
  volunteer: "Volunteers",
  ministry_staff: "Ministry Staff",
  finance_committee: "Finance Committee",
  elder: "Elders Only",
}

const ROLE_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  public: "info",
  member: "neutral",
  volunteer: "warning",
  ministry_staff: "info",
  finance_committee: "success",
  elder: "danger",
}

function RoleBadge({ role }: { role: string }) {
  return (
    <StatusPill tone={ROLE_TONE[role] ?? "neutral"}>
      {ROLE_LABELS[role] ?? role}
    </StatusPill>
  )
}

function formatSize(bytes: number | null) {
  if (bytes == null) return "—"
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const UNFILED = "__unfiled__"

const folderFormSchema = createFolderSchema
  .pick({ name: true })
  .extend({ minRoleRequired: z.enum(documentRoles) })

type FolderFormValues = z.infer<typeof folderFormSchema>

const emptyFolderForm: FolderFormValues = { name: "", minRoleRequired: "member" }

const uploadFormSchema = z.object({
  file: z.custom<File>((v) => typeof File !== "undefined" && v instanceof File, {
    message: "Choose a file to upload.",
  }),
  folderId: z.string(),
  minRoleRequired: z.enum(documentRoles),
})

type UploadFormValues = z.infer<typeof uploadFormSchema>

const emptyUploadForm = {
  file: undefined,
  folderId: UNFILED,
  minRoleRequired: "member",
} as unknown as UploadFormValues

const roleOptions = documentRoles.map((r) => ({ value: r, label: ROLE_LABELS[r] }))

interface SignedUpload {
  stub: boolean
  apiKey: string
  timestamp: number
  folder: string
  publicId: string
  signature: string
  uploadUrl: string
  secureUrl: string
}

function FolderTile({
  folder,
  childCount,
  onOpen,
}: {
  folder: DocumentFolderDto
  childCount: number
  onOpen: () => void
}) {
  const total = folder.itemCount + childCount
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col items-center gap-2 rounded-2xl border border-transparent bg-transparent px-3 py-4 text-center transition-colors hover:border-border hover:bg-card hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
    >
      <FolderIcon className="size-[4.5rem] transition-transform group-hover:scale-[1.03]" />
      <div className="min-w-0 w-full space-y-1">
        <p className="truncate text-sm font-medium text-foreground">{folder.name}</p>
        <p className="text-xs text-zinc-500">
          {total} {total === 1 ? "item" : "items"}
        </p>
        <div className="flex justify-center pt-0.5">
          <RoleBadge role={folder.minRoleRequired} />
        </div>
      </div>
    </button>
  )
}

export default function DocumentsPage() {
  const activeCampusId = useBranchStore((s) => s.activeCampusId)
  const [folders, setFolders] = React.useState<DocumentFolderDto[]>([])
  const [documents, setDocuments] = React.useState<ChurchDocumentDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null)

  const [folderDialog, setFolderDialog] = React.useState(false)
  const folderForm = useForm<FolderFormValues>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: emptyFolderForm,
  })

  const [uploadDialog, setUploadDialog] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const uploadForm = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: emptyUploadForm,
  })
  const [fileInputKey, setFileInputKey] = React.useState(0)

  function openFolderDialog() {
    folderForm.reset(emptyFolderForm)
    setFolderDialog(true)
  }

  function openUploadDialog() {
    uploadForm.reset({
      ...emptyUploadForm,
      folderId: currentFolderId ?? UNFILED,
    })
    setFileInputKey((k) => k + 1)
    setUploadDialog(true)
  }

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      apiClient.get<ApiResponse<DocumentFolderDto[]>>("/documents/folders", {
        params: { campusId: activeCampusId },
      }),
      apiClient.get<ApiResponse<ChurchDocumentDto[]>>("/documents", {
        params: { campusId: activeCampusId },
      }),
    ])
      .then(([f, d]) => {
        if (cancelled) return
        setFolders(f.data.data)
        setDocuments(d.data.data)
      })
      .catch((err: Error) => !cancelled && toast.error(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [activeCampusId])

  const folderById = React.useMemo(() => {
    const map = new Map(folders.map((f) => [f.id, f]))
    return map
  }, [folders])

  const childFolderCount = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of folders) {
      if (!f.parentId) continue
      counts.set(f.parentId, (counts.get(f.parentId) ?? 0) + 1)
    }
    return counts
  }, [folders])

  const breadcrumb = React.useMemo(() => {
    const trail: DocumentFolderDto[] = []
    let cursor = currentFolderId
    while (cursor) {
      const folder = folderById.get(cursor)
      if (!folder) break
      trail.unshift(folder)
      cursor = folder.parentId
    }
    return trail
  }, [currentFolderId, folderById])

  const query = searchQuery.trim().toLowerCase()
  const foldersHere = folders.filter((f) => {
    const inScope = (f.parentId ?? null) === currentFolderId
    if (!inScope) return false
    if (!query) return true
    return f.name.toLowerCase().includes(query)
  })
  const docsHere = documents.filter((d) => {
    const inScope = (d.folderId ?? null) === currentFolderId
    if (!inScope) return false
    if (!query) return true
    return d.title.toLowerCase().includes(query)
  })

  async function handleCreateFolder(values: FolderFormValues) {
    try {
      const res = await apiClient.post<ApiResponse<DocumentFolderDto>>("/documents/folders", {
        name: values.name,
        minRoleRequired: values.minRoleRequired,
        parentId: currentFolderId,
        campusId: null,
      })
      setFolders((prev) => [res.data.data, ...prev])
      setFolderDialog(false)
      folderForm.reset(emptyFolderForm)
      toast.success("Folder created")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create the folder.")
    }
  }

  async function handleUpload(values: UploadFormValues) {
    const uploadFile = values.file
    const uploadFolderId = values.folderId === UNFILED ? "" : values.folderId
    setUploading(true)
    try {
      const signRes = await apiClient.post<ApiResponse<SignedUpload>>("/documents/sign-upload", {
        filename: uploadFile.name,
        folder: "evolve-church/documents",
      })
      const signed = signRes.data.data

      let url = signed.secureUrl
      let publicId = signed.publicId
      if (!signed.stub) {
        const body = new FormData()
        body.append("file", uploadFile)
        body.append("api_key", signed.apiKey)
        body.append("timestamp", String(signed.timestamp))
        body.append("folder", signed.folder)
        body.append("public_id", signed.publicId)
        body.append("signature", signed.signature)
        const upload = await fetch(signed.uploadUrl, { method: "POST", body })
        if (!upload.ok) throw new Error("The file couldn't be uploaded to storage.")
        const uploaded = await upload.json()
        url = uploaded.secure_url ?? url
        publicId = uploaded.public_id ?? publicId
      }

      const ext = uploadFile.name.includes(".") ? uploadFile.name.split(".").pop() : undefined
      const res = await apiClient.post<ApiResponse<ChurchDocumentDto>>("/documents", {
        title: uploadFile.name,
        folderId: uploadFolderId || null,
        cloudinaryPublicId: publicId,
        cloudinaryUrl: url,
        format: ext?.slice(0, 20),
        fileSizeBytes: uploadFile.size,
        minRoleRequired: values.minRoleRequired,
      })
      setDocuments((prev) => [res.data.data, ...prev])
      if (uploadFolderId) {
        setFolders((prev) =>
          prev.map((f) => (f.id === uploadFolderId ? { ...f, itemCount: f.itemCount + 1 } : f))
        )
      }
      setUploadDialog(false)
      uploadForm.reset(emptyUploadForm)
      setFileInputKey((k) => k + 1)
      toast.success(`${uploadFile.name} uploaded`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const currentFolder = currentFolderId ? folderById.get(currentFolderId) : null

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <PageHeader
          title="Documents"
          description="Bylaws, minutes, and handbooks with role-based access."
          icon={<ShieldCheck className="size-5 text-brand" strokeWidth={1.75} />}
          actions={
            <>
              <div className="relative hidden w-56 sm:block">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Search here…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 rounded-lg border-zinc-200 bg-zinc-50 pl-8 text-xs shadow-xs"
                />
              </div>
              <TableAddButton onClick={openFolderDialog}>
                <Plus className="size-3.5 text-zinc-500" strokeWidth={1.75} />
                New Folder
              </TableAddButton>
              <TableAddButton onClick={openUploadDialog}>
                <Upload className="size-3.5 text-zinc-500" strokeWidth={1.75} />
                Upload
              </TableAddButton>
            </>
          }
        />

        <div className="space-y-6 p-6 md:p-8">
          <nav className="flex flex-wrap items-center gap-1 text-sm text-zinc-500">
            <button
              type="button"
              onClick={() => setCurrentFolderId(null)}
              className={cn(
                "rounded-md px-1.5 py-0.5 transition-colors hover:bg-zinc-100 hover:text-foreground",
                !currentFolderId && "font-medium text-foreground"
              )}
            >
              All folders
            </button>
            {breadcrumb.map((folder) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="size-3.5 shrink-0 text-zinc-300" />
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className={cn(
                    "max-w-[12rem] truncate rounded-md px-1.5 py-0.5 transition-colors hover:bg-zinc-100 hover:text-foreground",
                    folder.id === currentFolderId && "font-medium text-foreground"
                  )}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading documents…</p>
          ) : (
            <>
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-foreground">
                    {currentFolder ? currentFolder.name : "Folders"}
                  </h3>
                  {currentFolder ? (
                    <p className="text-xs text-zinc-500">
                      {foldersHere.length} folders · {docsHere.length} files
                    </p>
                  ) : null}
                </div>

                {foldersHere.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {foldersHere.map((folder) => (
                      <FolderTile
                        key={folder.id}
                        folder={folder}
                        childCount={childFolderCount.get(folder.id) ?? 0}
                        onOpen={() => {
                          setCurrentFolderId(folder.id)
                          setSearchQuery("")
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-200 bg-[#fbfcfb] px-4 py-10 text-center">
                    <FolderIcon className="mx-auto size-14 opacity-80" />
                    <p className="mt-3 text-sm font-medium text-zinc-800">
                      {currentFolder ? "No nested folders here" : "No folders yet"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Create a folder to organize bylaws, minutes, and handbooks.
                    </p>
                  </div>
                )}
              </section>

              {(currentFolderId || docsHere.length > 0) && (
                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">
                    {currentFolder ? "Files in this folder" : "Unfiled files"}
                  </h3>
                  <TablePanel>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-4">Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Added</TableHead>
                          <TableHead>Access</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {docsHere.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="pl-4">
                              <a
                                href={doc.cloudinaryUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2.5 font-medium text-foreground hover:text-brand"
                              >
                                <FileIcon strokeWidth={1.8} className="size-4 text-brand" />
                                <span className="truncate">{doc.title}</span>
                              </a>
                              <p className="mt-0.5 pl-6.5 text-xs text-zinc-400">
                                by {doc.uploadedBy}
                              </p>
                            </TableCell>
                            <TableCell className="text-zinc-500">
                              {formatSize(doc.fileSizeBytes)}
                            </TableCell>
                            <TableCell className="text-zinc-500">
                              {format(new Date(doc.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <RoleBadge role={doc.minRoleRequired} />
                            </TableCell>
                          </TableRow>
                        ))}
                        {docsHere.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="py-10 text-center text-sm text-zinc-500"
                            >
                              No files in this folder yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TablePanel>
                </section>
              )}
            </>
          )}
        </div>

        <Sheet open={folderDialog} onOpenChange={setFolderDialog}>
          <SheetContent side="right" inset size="sm" className="p-0">
            <Form {...folderForm}>
              <form
                onSubmit={folderForm.handleSubmit(handleCreateFolder)}
                className="flex h-full flex-col"
              >
                <SheetHeader className="pr-12">
                  <SheetTitle>New folder</SheetTitle>
                  <SheetDescription>
                    {currentFolder
                      ? `Created inside “${currentFolder.name}”.`
                      : "Choose who is allowed to open files inside it."}
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <TextFormField
                    control={folderForm.control}
                    name="name"
                    label="Name"
                    placeholder="Youth Ministry Resources"
                  />
                  <SelectFormField
                    control={folderForm.control}
                    name="minRoleRequired"
                    label="Who can view"
                    options={roleOptions}
                  />
                </SheetBody>
                <SheetFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg px-4"
                    onClick={() => setFolderDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="h-9 rounded-lg px-4 font-normal"
                    disabled={folderForm.formState.isSubmitting}
                  >
                    Create folder
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>

        <Sheet open={uploadDialog} onOpenChange={setUploadDialog}>
          <SheetContent side="right" inset size="sm" className="p-0">
            <Form {...uploadForm}>
              <form
                onSubmit={uploadForm.handleSubmit(handleUpload)}
                className="flex h-full flex-col"
              >
                <SheetHeader className="pr-12">
                  <SheetTitle>Upload a file</SheetTitle>
                  <SheetDescription>
                    Files are stored securely and shared only with the roles you pick.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FormField
                    control={uploadForm.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File</FormLabel>
                        <FormControl>
                          <input
                            key={fileInputKey}
                            type="file"
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            onChange={(e) => field.onChange(e.target.files?.[0])}
                            className="block w-full cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-[#f8faf9] p-3 text-xs text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-ink"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <SelectFormField
                      control={uploadForm.control}
                      name="folderId"
                      label="Folder"
                      options={[
                        { value: UNFILED, label: "Unfiled" },
                        ...folders.map((f) => ({ value: f.id, label: f.name })),
                      ]}
                    />
                    <SelectFormField
                      control={uploadForm.control}
                      name="minRoleRequired"
                      label="Who can view"
                      options={roleOptions}
                    />
                  </div>
                </SheetBody>
                <SheetFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg px-4"
                    onClick={() => setUploadDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={uploading}
                    className="h-9 rounded-lg px-4 font-normal"
                  >
                    {uploading ? "Uploading…" : "Upload"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  )
}
