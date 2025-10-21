import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$id/app/licenses')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$id/app/licenses"!</div>
}
