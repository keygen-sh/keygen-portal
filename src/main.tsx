import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import * as Sentry from "@sentry/react"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import * as sentry from "@/sentry"

sentry.init()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // don't refetch if data is < 5m old
      refetchOnWindowFocus: false, // disable refetch on refocus
      retry: false, // disable default retries to prevent cascading failures
    },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <StrictMode>
      <Sentry.ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    </StrictMode>,
  )
}
