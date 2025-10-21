import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$id/app/groups')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$id/app/groups"!</div>
}
