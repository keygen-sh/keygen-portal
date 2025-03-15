import { Outlet } from "@tanstack/react-router";

export default function AppLayout() {
  return (
    <main>
      <div>
        <h1>App Layout</h1>
      </div>
      <Outlet />
    </main>
  );
}
