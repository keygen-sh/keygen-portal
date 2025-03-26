import { Outlet, useMatches } from "@tanstack/react-router"
import Logo from "@assets/logos/logo.svg"

import BackButton from "@components/BackButton"

export default function AuthLayout() {
  const matches = useMatches()
  const currentRoute = matches[matches.length - 1]

  const label = (() => {
    if (currentRoute.routeId === "/auth/password") return "Go Back"
    if (currentRoute.routeId === "/auth/verify") return "Return to Login"
    return ""
  })()

  return (
    <main className="flex min-h-screen">
      <div className="flex w-full flex-col bg-background md:w-1/2">
        <nav className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 md:pt-8">
          <div className="justify-self-center">
            {label && (
              <BackButton
                path={"/auth/login"}
                label={label}
                className="hidden md:flex"
              />
            )}
          </div>
          <div className="justify-self-center">
            <img src={Logo} alt="Keygen Logo" className="h-5" />
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-center p-4">
          <Outlet />
        </div>
      </div>
      <div className="hidden w-1/2 bg-brand-background-2 md:block">
        {/* TODO: Hero */}
      </div>
    </main>
  )
}
