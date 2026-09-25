import { useEffect } from "react"
import {
  Outlet,
  useMatches,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"

import { Toaster } from "@/components/ui/sonner"

import logoDark from "/logo-dark.svg"
import logoLight from "/logo-light.svg"

import * as keygen from "@/keygen"

import { useSession } from "@/hooks/use-session"

import { redirectTarget } from "@/lib/auth"

import * as Auth from "@/components/auth"
import * as Loading from "@/components/loading"
import BackButton from "@/components/back-button"

export default function AuthLayout() {
  const navigate = useNavigate()
  const { user } = useSession()
  const matches = useMatches()
  const redirect = useSearch({
    strict: false,
    select: (search) => search.redirect,
  })

  // Redirect already-authenticated users
  useEffect(() => {
    if (!user) return
    if (redirect) {
      void navigate({ ...redirectTarget(redirect), replace: true })
      return
    }
    void navigate({
      to: "/$accountId/app",
      params: { accountId: keygen.client.currentAccount ?? keygen.config.id },
      replace: true,
    })
  }, [user, redirect, navigate])

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
    if (currentRoute.routeId === "/$accountId/auth/forgot")
      return "Return to Login"
    return ""
  })()

  return (
    <div className="mt-[var(--demo-offset,0px)] flex min-h-[calc(100dvh_-_var(--demo-offset,0px))]">
      <Toaster />
      <section className="z-20 flex w-full flex-col bg-background md:w-1/2 md:shadow-2xl/30">
        <nav className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 pt-8 md:pt-10">
          <div className="justify-self-center">
            {label && <BackButton label={label} className="hidden md:flex" />}
          </div>
          <div className="justify-self-center">
            <img
              src={logoLight}
              alt="Keygen Logo"
              className="h-6 md:h-8 dark:hidden"
            />
            <img
              src={logoDark}
              alt="Keygen Logo"
              className="hidden h-6 md:h-8 dark:block"
            />
          </div>
        </nav>
        <main className="flex flex-1 items-center justify-center px-4">
          <Outlet />
        </main>
      </section>
      <section className="dark z-10 hidden w-1/2 border-l bg-[rgb(0,60,91)] md:block">
        <Auth.Hero />
      </section>
    </div>
  )
}
