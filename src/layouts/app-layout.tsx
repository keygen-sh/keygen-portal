import { Outlet } from "@tanstack/react-router"
import { useSession } from "@/hooks/use-session"
import { useSidebar } from "@/components/ui/sidebar"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

import * as Sidebar from "@/components/sidebar"
import * as Loading from "@/components/loading"

/**
 * Render provider first then delegate the rest of the component,
 * so we can call hooks without violating rules and pushing the provider further up the tree.
 */
export default function AppLayout() {
  const { initializing } = useSession()

  if (initializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading.Dots />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  )
}

function AppLayoutContent() {
  const { open } = useSidebar()
  const isMobile = useMobile()

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
      <Toaster />
    </div>
  )
}
