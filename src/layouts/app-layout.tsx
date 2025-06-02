import { Outlet } from "@tanstack/react-router"
import { useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

import * as Sidebar from "@/components/sidebar"

/**
 * Render provider first then delegate the rest of the component,
 * so we can call hooks without violating rules and pushing the provider further up the tree.
 */
export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  )
}

function AppLayoutContent() {
  const { open } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <SidebarProvider>
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
        <Toaster />
      </div>
    </SidebarProvider>
  )
}
