import { Outlet } from "@tanstack/react-router"
import logo from "/logo.svg"

import BackButton from "@/components/back-button"

export default function ErrorLayout() {
  return (
    <section className="flex min-h-screen w-full flex-col bg-background">
      <nav className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 pt-4 md:pt-8">
        <div className="justify-self-center">
          <BackButton className="hidden md:flex" />
        </div>
        <div className="justify-self-center">
          <img src={logo} alt="Keygen Logo" className="h-6 md:h-5" />
        </div>
      </nav>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full rounded bg-background-1 drop-shadow-2xl drop-shadow-black/10 md:w-1/2">
          <Outlet />
        </div>
      </main>
    </section>
  )
}
