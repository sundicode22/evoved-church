"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  Download01Icon,
  PlusSignIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  Folder01Icon,
  File01Icon,
  SecurityCheckIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"

export default function VaultPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const folders = [
    { name: "Church Constitution & Governance Bylaws", count: "4 documents", minRole: "Public", color: "text-blue-600 bg-blue-50" },
    { name: "Board of Elders & Trustee Minutes", count: "18 documents", minRole: "Elders Only", color: "text-rose-600 bg-rose-50" },
    { name: "Financial Audit Statements (501c3)", count: "12 files", minRole: "Finance Committee", color: "text-emerald-600 bg-emerald-50" },
    { name: "Volunteer Training & Safety Handbooks", count: "8 guides", minRole: "Volunteers", color: "text-amber-600 bg-amber-50" },
    { name: "Sermon Manuscript & Slide Vault", count: "52 items", minRole: "Ministry Staff", color: "text-purple-600 bg-purple-50" },
    { name: "Creative Arts Audio & Stems", count: "34 stems", minRole: "Worship Team", color: "text-teal-600 bg-teal-50" },
  ]

  const recentFiles = [
    { title: "2024_Church_Annual_Bylaws_Approved.pdf", size: "2.4 MB", uploadedBy: "Pastor David Johnson", date: "Nov 15, 2024", access: "Public" },
    { title: "Financial_Audit_Report_Q3_2024.pdf", size: "5.1 MB", uploadedBy: "Eleanor Pena (Finance Dir)", date: "Nov 10, 2024", access: "Finance Committee" },
    { title: "Child_Safety_Protection_Policy_2024.pdf", size: "1.2 MB", uploadedBy: "Marcus Vance", date: "Oct 28, 2024", access: "Volunteers" },
    { title: "Sunday_Worship_Stems_LionAndTheLamb.zip", size: "48.2 MB", uploadedBy: "Sarah Miller", date: "Nov 21, 2024", access: "Worship Team" },
  ]

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
      <SidebarInset className="bg-[#fbfcfb] dark:bg-zinc-950 min-h-screen">
        
        {/* HEADER BAR */}
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Cloudinary Media & Document Vault</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Role-gated church directory, secure signed uploads, sermon media, and pastoral policies.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
              </button>
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
              </button>

              <Button variant="outline" className="h-9 px-3.5 rounded-lg border-zinc-200 text-xs font-semibold gap-1.5 shadow-2xs">
                <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-3.5 text-zinc-600" />
                <span>Audit Logs</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Upload to Vault</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>Storage Usage: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">14.2 GB of 100 GB Cloudinary Vault</strong></span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>Encrypted & Signed URLs Active</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
                />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-zinc-50 border-zinc-200 rounded-lg focus-visible:ring-emerald-500"
                />
              </div>

              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-zinc-600 border-zinc-200 rounded-lg gap-1.5">
                <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-3 text-zinc-500" />
                <span>Filter</span>
              </Button>

              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-zinc-600 border-zinc-200 rounded-lg gap-1.5">
                <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-3 text-zinc-500" />
                <span>Sort</span>
              </Button>
            </div>
          </div>
        </div>

        {/* FOLDERS GRID & RECENT FILES */}
        <div className="p-8 space-y-8">
          
          {/* FOLDERS */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Role-Gated Ministry Folders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {folders.map((folder, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-emerald-400 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${folder.color}`}>
                      <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} className="size-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {folder.minRole}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {folder.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1">{folder.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT FILES */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Recently Uploaded Documents
            </h3>
            <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/70 border-b border-zinc-200/70 text-zinc-400 font-semibold uppercase tracking-wider text-[11px] dark:bg-zinc-900/40">
                    <tr>
                      <th className="px-6 py-3.5">Document Title</th>
                      <th className="px-6 py-3.5">File Size</th>
                      <th className="px-6 py-3.5">Uploaded By</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Security Tier</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {recentFiles.map((file, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                          <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-4 text-emerald-600" />
                          <span>{file.title}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{file.size}</td>
                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 font-medium">{file.uploadedBy}</td>
                        <td className="px-6 py-4 text-zinc-400">{file.date}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {file.access}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="size-7">
                            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4 text-zinc-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
