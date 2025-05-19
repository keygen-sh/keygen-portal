import { Outlet } from "@tanstack/react-router"
import { useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import { SidebarTrigger } from "@/components/ui/sidebar"

import * as Sidebar from "@/components/sidebar"

export default function AppLayout() {
  const { open } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar.Panel />
      {isMobile && (
        <SidebarTrigger
          className={cn(
            "absolute top-4 left-4 z-50 rounded-full p-2 transition-opacity duration-300",
            open
              ? "pointer-events-none opacity-0"
              : "pointer-events-auto opacity-100 delay-200",
          )}
        />
      )}
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
