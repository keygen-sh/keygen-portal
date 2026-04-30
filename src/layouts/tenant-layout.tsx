import { Outlet } from "@tanstack/react-router"

import { SessionProvider } from "@/providers/session-provider"
import { useSession } from "@/hooks/use-session"

import * as Loading from "@/components/loading"

export default function TenantLayout() {
  return (
    <SessionProvider>
      <TenantLayoutContent />
    </SessionProvider>
  )
}

function TenantLayoutContent() {
  const { initializing } = useSession()

  if (initializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading.Dots />
      </div>
    )
  }

  return <Outlet />
}
