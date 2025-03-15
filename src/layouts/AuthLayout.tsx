import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <main>
      <div>
        <h1>Auth Layout</h1>
      </div>
      <Outlet />
    </main>
  );
}
