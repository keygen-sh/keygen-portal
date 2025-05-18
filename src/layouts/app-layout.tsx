import { Outlet } from "@tanstack/react-router"
import { useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import * as Sidebar from "@/components/sidebar"

export default function AppLayout() {
  const { open } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar.Panel />
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-200",
          isMobile && open && "pointer-events-none blur-xs",
        )}
      >
        <Outlet />
      </main>
    </div>
  )
}
