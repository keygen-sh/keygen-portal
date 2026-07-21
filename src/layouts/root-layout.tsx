import { HeadContent, Outlet } from "@tanstack/react-router"

export default function RootLayout() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  )
}
