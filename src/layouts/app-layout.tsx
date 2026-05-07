import { useEffect } from "react"
import { Outlet, useNavigate } from "@tanstack/react-router"

import { TooltipProvider } from "@/components/ui/tooltip"
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar"

import { useMobile } from "@/hooks/use-mobile"
import { useSession } from "@/hooks/use-session"
import { EnvironmentProvider } from "@/providers/environment-provider"

import { cn } from "@/lib/utils"

import * as keygen from "@/keygen"

import * as Sidebar from "@/components/sidebar"

/**
 * Render provider first then delegate the rest of the component,
 * so we can call hooks without violating rules and pushing the provider further up the tree.
 */
export default function AppLayout() {
  const navigate = useNavigate()
  const { user } = useSession()

  useEffect(() => {
    if (!user) {
      void navigate({
        to: "/$accountId/auth/login",
        params: { accountId: keygen.config.id },
        replace: true,
      })
    }
  }, [user, navigate])

  if (!user) return null

  return (
    <EnvironmentProvider>
      <TooltipProvider
        delayDuration={120}
        skipDelayDuration={400}
        disableHoverableContent
      >
        <SidebarProvider>
          <AppLayoutContent />
        </SidebarProvider>
      </TooltipProvider>
    </EnvironmentProvider>
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
    </div>
  )
}
