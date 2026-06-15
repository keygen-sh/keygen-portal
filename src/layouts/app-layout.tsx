import { useEffect } from "react"
import { Outlet, useNavigate, useRouter } from "@tanstack/react-router"

import { TooltipProvider } from "@/components/ui/tooltip"
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar"

import { useMobile } from "@/hooks/use-mobile"
import { useSession } from "@/hooks/use-session"
import { EnvironmentProvider } from "@/providers/environment-provider"
import { PermissionsProvider } from "@/providers/permissions-provider"

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
      <PermissionsProvider>
        <TooltipProvider
          delayDuration={120}
          skipDelayDuration={400}
          disableHoverableContent
        >
          <SidebarProvider>
            <AppLayoutContent />
          </SidebarProvider>
        </TooltipProvider>
      </PermissionsProvider>
    </EnvironmentProvider>
  )
}

function AppLayoutContent() {
  const { open, setOpen } = useSidebar()
  const isMobile = useMobile()
  const router = useRouter()

  // close sidebar on mobile whenever navigation resolves
  useEffect(() => {
    if (!isMobile) return
    return router.subscribe("onResolved", () => setOpen(false))
  }, [isMobile, router, setOpen])

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <Sidebar.Panel />
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-200",
          isMobile && open && "pointer-events-none blur-xs",
        )}
      >
        <Outlet />
      </main>
      {isMobile && open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="absolute inset-0 z-40 cursor-default"
        />
      )}
    </div>
  )
}
