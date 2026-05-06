import { useEffect } from "react"
import { Outlet, useMatches, useNavigate } from "@tanstack/react-router"

import logo from "/logo.svg"

import * as keygen from "@/keygen"

import { AuthProvider } from "@/providers/auth-provider"
import { useSession } from "@/hooks/use-session"

import * as Loading from "@/components/loading"
import BackButton from "@/components/back-button"

export default function AuthLayout() {
  const navigate = useNavigate()
  const { user } = useSession()
  const matches = useMatches()

  // Redirect already-authenticated users
  useEffect(() => {
    if (!user) return
    void navigate({
      to: "/$accountId/app/dashboard",
      params: { accountId: keygen.config.id },
      replace: true,
    })
  }, [user, navigate])

  // NB(cazden) Loading state to eliminate jarring UI transitions during redirects, e.g.
  //            if user navs to login page but has a valid session, they're redirected to
  //            app dashboard, and without this check they'd briefly see the login page.
  if (user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading.Dots />
      </div>
    )
  }

  const currentRoute = matches[matches.length - 1] as { routeId: string }

  const label = (() => {
    if (currentRoute.routeId === "/$accountId/auth/password") return "Go Back"
    if (currentRoute.routeId === "/$accountId/auth/sso")
      return "Return to Login"
    if (currentRoute.routeId === "/$accountId/auth/verify")
      return "Return to Login"
    if (currentRoute.routeId === "/$accountId/auth/recovery")
      return "Return to Login"
    if (currentRoute.routeId === "/$accountId/auth/sent")
      return "Return to Login"
    return ""
  })()

  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <section className="flex w-full flex-col bg-background md:w-1/2">
          <nav className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 pt-4 md:pt-8">
            <div className="justify-self-center">
              {label && (
                <BackButton
                  path={"/$id/auth/login"}
                  label={label}
                  className="hidden md:flex"
                />
              )}
            </div>
            <div className="justify-self-center">
              <img src={logo} alt="Keygen Logo" className="h-6 md:h-5" />
            </div>
          </nav>
          <main className="flex flex-1 items-center justify-center px-4">
            <Outlet />
          </main>
        </section>
        <section className="hidden w-1/2 bg-brand-background-2 md:block">
          {/* TODO: Hero */}
        </section>
      </div>
    </AuthProvider>
  )
}
