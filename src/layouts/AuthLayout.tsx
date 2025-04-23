import { Outlet, useMatches } from "@tanstack/react-router"
import logo from "@assets/logos/logo.svg"

import { AuthProvider } from "@providers/AuthProvider"

import BackButton from "@components/BackButton"

export default function AuthLayout() {
  const matches = useMatches()
  const currentRoute = matches[matches.length - 1] as { routeId: string }

  const label = (() => {
    if (currentRoute.routeId === "/$id/auth/password") return "Go Back"
    if (currentRoute.routeId === "/$id/auth/verify") return "Return to Login"
    if (currentRoute.routeId === "/$id/auth/recovery") return "Return to Login"
    if (currentRoute.routeId === "/$id/auth/sent") return "Return to Login"
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
