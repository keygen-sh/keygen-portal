import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$id/app/machines')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$id/app/machines"!</div>
}
