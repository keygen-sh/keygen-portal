import { lazy, Suspense } from "react"
import { HeadContent, Outlet } from "@tanstack/react-router"

import * as keygen from "@/keygen"

const DemoBanner = lazy(() => import("@/demo/components/banner"))

export default function RootLayout() {
  return (
    <>
      <HeadContent />
      <Outlet />
      {keygen.config.isDemo && (
        <Suspense>
          <DemoBanner />
        </Suspense>
      )}
    </>
  )
}
