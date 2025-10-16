import { useState, useEffect } from "react"
import { Outlet } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

import { Toaster } from "@/components/ui/sonner"
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

import { EnvironmentProvider } from "@/providers/environment-provider"
import { useSession } from "@/hooks/use-session"
import { useMobile } from "@/hooks/use-mobile"

import * as Sidebar from "@/components/sidebar"
import * as Loading from "@/components/loading"

import * as Developer from "@/developer"

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

  const [showSeeder, setShowSeeder] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement | null)?.isContentEditable
      if (isTyping) return
      const ctrlOrMeta = e.ctrlKey || e.metaKey
      if (ctrlOrMeta && e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault()
        setShowSeeder((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

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
      <Developer.Overlay
        open={showSeeder}
        onClose={() => setShowSeeder(false)}
      />
      <Toaster />
    </div>
  )
}
