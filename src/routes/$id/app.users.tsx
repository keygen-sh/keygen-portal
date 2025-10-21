import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$id/app/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$id/app/users"!</div>
}
