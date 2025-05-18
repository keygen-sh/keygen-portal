import { Outlet } from "@tanstack/react-router"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function RootLayout() {
  return (
    <SidebarProvider>
      <Outlet />
    </SidebarProvider>
  )
}
