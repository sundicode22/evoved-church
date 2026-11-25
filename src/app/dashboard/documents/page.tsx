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
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
import { TableAddButton, TablePanel } from "@/components/table-panel"
import { File as File, Folder as Folder, Plus, Search as Search, ShieldCheck, Upload as Upload } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  public: "Public",
  member: "Members",
  volunteer: "Volunteers",
  ministry_staff: "Ministry Staff",
  finance_committee: "Finance Committee",
  elder: "Elders Only",
}

const ROLE_STYLES: Record<string, string> = {
  public: "border-blue-200 bg-blue-50 text-blue-700",
  member: "border-zinc-200 bg-zinc-50 text-zinc-700",
  volunteer: "border-amber-200 bg-amber-50 text-amber-700",
  ministry_staff: "border-purple-200 bg-purple-50 text-purple-700",
  finance_committee: "border-emerald-200 bg-emerald-50 text-emerald-700",
  elder: "border-rose-200 bg-rose-50 text-rose-700",
}

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-medium ${ROLE_STYLES[role] ?? ROLE_STYLES.member}`}
    >
      {ROLE_LABELS[role] ?? role}
    </Badge>
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

export default function DocumentsPage() {
  const activeCampusId = useBranchStore((s) => s.activeCampusId)
  const [folders, setFolders] = React.useState<DocumentFolderDto[]>([])
  const [documents, setDocuments] = React.useState<ChurchDocumentDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null)

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
    uploadForm.reset(emptyUploadForm)
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

  const query = searchQuery.trim().toLowerCase()
  const visibleFolders = folders.filter((f) => f.name.toLowerCase().includes(query))
  const visibleDocs = documents.filter(
    (d) =>
      (!selectedFolderId || d.folderId === selectedFolderId) &&
      d.title.toLowerCase().includes(query)
  )
  const folderName = (id: string | null) => folders.find((f) => f.id === id)?.name ?? "Unfiled"
  const selectedFolder = folders.find((f) => f.id === selectedFolderId)

  async function handleCreateFolder(values: FolderFormValues) {
    try {
      const res = await apiClient.post<ApiResponse<DocumentFolderDto>>("/documents/folders", {
        name: values.name,
        minRoleRequired: values.minRoleRequired,
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
      <SidebarInset className="min-h-screen bg-white dark:bg-zinc-950">
        <PageHeader
          title="Documents"
          description="Bylaws, minutes, and handbooks with role-based access."
          icon={<ShieldCheck className="size-5 text-brand" strokeWidth={1.75} />}
          actions={
            <>
              <div className="relative hidden w-56 sm:block">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Search documents…"
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

        <div className="space-y-8 p-8">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading documents…</p>
          ) : (
            <>
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Folders</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleFolders.map((folder) => {
                    const active = folder.id === selectedFolderId
                    return (
                      <Card
                        key={folder.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedFolderId(active ? null : folder.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setSelectedFolderId(active ? null : folder.id)
                          }
                        }}
                        className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${
                          active ? "border-emerald-400 ring-2 ring-emerald-100" : "border-zinc-200/60 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Folder strokeWidth={1.8} className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-900">{folder.name}</p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {folder.itemCount} {folder.itemCount === 1 ? "file" : "files"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400">
                          <span>Who can view</span>
                          <RoleBadge role={folder.minRoleRequired} />
                        </div>
                      </Card>
                    )
                  })}
                  {visibleFolders.length === 0 && (
                    <p className="text-sm text-zinc-500">No folders match your search.</p>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedFolder ? selectedFolder.name : "All files"}
                  </h3>
                  {selectedFolder && (
                    <button
                      onClick={() => setSelectedFolderId(null)}
                      className="text-xs font-medium text-emerald-700 hover:underline"
                    >
                      Show all files
                    </button>
                  )}
                </div>

                <TablePanel>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Name</TableHead>
                        <TableHead>Folder</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead>Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleDocs.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="pl-4">
                            <a
                              href={doc.cloudinaryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2.5 font-medium text-zinc-900 hover:text-emerald-700"
                            >
                              <File strokeWidth={1.8} className="size-4 text-emerald-600" />
                              <span className="truncate">{doc.title}</span>
                            </a>
                            <p className="mt-0.5 pl-6.5 text-xs text-zinc-400">by {doc.uploadedBy}</p>
                          </TableCell>
                          <TableCell className="text-zinc-500">{folderName(doc.folderId)}</TableCell>
                          <TableCell className="text-zinc-500">{formatSize(doc.fileSizeBytes)}</TableCell>
                          <TableCell className="text-zinc-500">
                            {format(new Date(doc.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <RoleBadge role={doc.minRoleRequired} />
                          </TableCell>
                        </TableRow>
                      ))}
                      {visibleDocs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="py-10 text-center text-sm text-zinc-500">
                            No files here yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TablePanel>
              </section>
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
                <SheetDescription>Choose who is allowed to open files inside it.</SheetDescription>
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
                          className="block w-full cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-[#f8faf9] p-3 text-xs text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-emerald-700"
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
