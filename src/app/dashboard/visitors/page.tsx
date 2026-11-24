import { AppSidebar } from "@/components/app-sidebar"
import { KanbanBoard } from "@/components/visitors/kanban-board"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function VisitorsPage() {
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
      <SidebarInset className="bg-[#fbfcfb] dark:bg-zinc-950">
        <KanbanBoard />
      </SidebarInset>
    </SidebarProvider>
  )
}
