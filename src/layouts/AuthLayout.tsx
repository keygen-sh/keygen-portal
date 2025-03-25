import { Outlet } from "@tanstack/react-router"
import Logo from "@assets/logos/logo.svg"

export default function AuthLayout() {
  return (
    <main className="flex min-h-screen w-full">
      <div className="relative flex w-full items-center justify-center bg-background md:w-1/2">
        <div className="absolute top-10 left-1/2 flex w-full -translate-x-1/2 items-center justify-center">
          <img src={Logo} alt="Keygen Logo" className="h-5" />
        </div>
        <Outlet />
      </div>
      <div className="hidden w-1/2 bg-brand-background-2 md:block">
        {/* TODO: Hero */}
      </div>
    </main>
  )
}
