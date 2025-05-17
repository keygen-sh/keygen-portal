import { Outlet } from "@tanstack/react-router"
import { SidebarProvider } from "@/components/ui/sidebar"
import * as Sidebar from "@/components/sidebar"

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar.Panel />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
