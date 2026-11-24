"use client"

import * as React from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  documentRoles,
  type ChurchDocumentDto,
  type DocumentFolderDto,
} from "@/features/documents/schemas"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  PlusSignIcon,
  SearchIcon,
  Folder01Icon,
  File01Icon,
  SecurityCheckIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"

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
      className={`text-[10px] font-semibold ${ROLE_STYLES[role] ?? ROLE_STYLES.member}`}
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

const selectClass =
  "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"

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
  const [folderForm, setFolderForm] = React.useState({ name: "", minRoleRequired: "member" })

  const [uploadDialog, setUploadDialog] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [uploadFile, setUploadFile] = React.useState<File | null>(null)
  const [uploadRole, setUploadRole] = React.useState("member")
  const [uploadFolderId, setUploadFolderId] = React.useState<string>("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await apiClient.post<ApiResponse<DocumentFolderDto>>("/documents/folders", {
        name: folderForm.name,
        minRoleRequired: folderForm.minRoleRequired,
        campusId: null,
      })
      setFolders((prev) => [res.data.data, ...prev])
      setFolderDialog(false)
      setFolderForm({ name: "", minRoleRequired: "member" })
      toast.success("Folder created")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create the folder.")
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) {
      toast.error("Choose a file to upload.")
      return
    }
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
        minRoleRequired: uploadRole,
      })
      setDocuments((prev) => [res.data.data, ...prev])
      if (uploadFolderId) {
        setFolders((prev) =>
          prev.map((f) => (f.id === uploadFolderId ? { ...f, itemCount: f.itemCount + 1 } : f))
        )
      }
      setUploadDialog(false)
      setUploadFile(null)
      setUploadFolderId("")
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
      <SidebarInset className="min-h-screen bg-[#fbfcfb] dark:bg-zinc-950">
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Documents</span>
              </h1>
              <p className="mt-0.5 text-xs text-zinc-400">
                Bylaws, minutes, handbooks, and sermon files, with access limited by role.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
              </button>
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
              </button>
              <Button
                variant="outline"
                onClick={() => setFolderDialog(true)}
                className="h-9 gap-1.5 rounded-lg border-zinc-200 px-3.5 text-xs font-semibold shadow-2xs"
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5 text-zinc-600" />
                <span>New Folder</span>
              </Button>
              <Button
                onClick={() => setUploadDialog(true)}
                className="h-9 gap-1.5 rounded-lg bg-[#22c55e] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#16a34a]"
              >
                <HugeiconsIcon icon={Upload01Icon} strokeWidth={2.5} className="size-3.5" />
                <span>Upload</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>
                Folders: <strong className="text-zinc-800 dark:text-zinc-200">{folders.length}</strong>
              </span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>
                Files: <strong className="text-zinc-800 dark:text-zinc-200">{documents.length}</strong>
              </span>
            </div>
            <div className="relative w-56">
              <HugeiconsIcon
                icon={SearchIcon}
                strokeWidth={2}
                className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400"
              />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 rounded-lg border-zinc-200 bg-zinc-50 pl-8 text-xs focus-visible:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 p-8">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading documents…</p>
          ) : (
            <>
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Folders</h3>
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
                        className={`cursor-pointer rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                          active ? "border-emerald-400 ring-2 ring-emerald-100" : "border-zinc-200/60 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <HugeiconsIcon icon={Folder01Icon} strokeWidth={1.8} className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-zinc-900">{folder.name}</p>
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
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
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

                <Card className="overflow-hidden rounded-2xl border-zinc-200/80 p-0 shadow-xs">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-50/60">
                        <TableHead className="px-5 text-[11px] uppercase tracking-wider">Name</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider">Folder</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider">Size</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider">Added</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider">Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleDocs.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="px-5">
                            <a
                              href={doc.cloudinaryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2.5 font-medium text-zinc-900 hover:text-emerald-700"
                            >
                              <HugeiconsIcon icon={File01Icon} strokeWidth={1.8} className="size-4 text-emerald-600" />
                              <span className="truncate">{doc.title}</span>
                            </a>
                            <p className="mt-0.5 pl-6.5 text-[11px] text-zinc-400">by {doc.uploadedBy}</p>
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
                </Card>
              </section>
            </>
          )}
        </div>

        <Sheet open={folderDialog} onOpenChange={setFolderDialog}>
          <SheetContent side="right" inset size="sm" className="p-0">
            <form onSubmit={handleCreateFolder} className="flex h-full flex-col">
              <SheetHeader className="pr-12">
                <SheetTitle>New folder</SheetTitle>
                <SheetDescription>Choose who is allowed to open files inside it.</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="grid gap-1.5">
                  <Label htmlFor="folder-name" className="text-xs font-semibold text-zinc-700">
                    Name
                  </Label>
                  <Input
                    id="folder-name"
                    value={folderForm.name}
                    onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                    placeholder="Youth Ministry Resources"
                    className="h-9 rounded-lg"
                    required
                    minLength={2}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="folder-role" className="text-xs font-semibold text-zinc-700">
                    Who can view
                  </Label>
                  <select
                    id="folder-role"
                    value={folderForm.minRoleRequired}
                    onChange={(e) =>
                      setFolderForm({ ...folderForm, minRoleRequired: e.target.value })
                    }
                    className={selectClass}
                  >
                    {documentRoles.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="h-9 rounded-lg bg-[#22c55e] px-4 font-semibold text-white hover:bg-[#16a34a]"
                >
                  Create folder
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <Sheet open={uploadDialog} onOpenChange={setUploadDialog}>
          <SheetContent side="right" inset size="sm" className="p-0">
            <form onSubmit={handleUpload} className="flex h-full flex-col">
              <SheetHeader className="pr-12">
                <SheetTitle>Upload a file</SheetTitle>
                <SheetDescription>
                  Files are stored securely and shared only with the roles you pick.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">File</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    className="block w-full cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-[#f8faf9] p-3 text-xs text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="upload-folder" className="text-xs font-semibold text-zinc-700">
                      Folder
                    </Label>
                    <select
                      id="upload-folder"
                      value={uploadFolderId}
                      onChange={(e) => setUploadFolderId(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Unfiled</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="upload-role" className="text-xs font-semibold text-zinc-700">
                      Who can view
                    </Label>
                    <select
                      id="upload-role"
                      value={uploadRole}
                      onChange={(e) => setUploadRole(e.target.value)}
                      className={selectClass}
                    >
                      {documentRoles.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  disabled={uploading}
                  className="h-9 rounded-lg bg-[#22c55e] px-4 font-semibold text-white hover:bg-[#16a34a]"
                >
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  )
}
