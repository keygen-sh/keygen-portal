import { Outlet } from "@tanstack/react-router";

export default function RootLayout() {
  return (
    <main>
      <div>
        <h1>Root Layout</h1>
      </div>
      <Outlet />
    </main>
  );
}
