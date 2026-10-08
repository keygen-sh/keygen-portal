import "@/demo/storage"

import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import * as Sentry from "@sentry/react"
import {
  RouterProvider,
  createRouter,
  isNotFound,
  isRedirect,
} from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { routeTree } from "./routeTree.gen"
import * as sentry from "@/sentry"
import * as fathom from "@/fathom"
import * as keygen from "@/keygen"
import * as Page from "@/pages/error"
import * as Loading from "@/components/loading"

sentry.init()

// reloads tabs left open across a deploy when their old build fails to load
const STALE_BUILD_RELOAD_KEY = "keygen.build.reload"

let isReloadingStaleBuild = false

window.addEventListener("vite:preloadError", () => {
  try {
    if (sessionStorage.getItem(STALE_BUILD_RELOAD_KEY) === __APP_VERSION__) {
      return
    }
    sessionStorage.setItem(STALE_BUILD_RELOAD_KEY, __APP_VERSION__)
  } catch {
    return
  }

  isReloadingStaleBuild = true
  window.location.reload()
})

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
  basepath: keygen.config.basepath,
  context: { queryClient },
  notFoundMode: "root",
  defaultNotFoundComponent: () => <Page.NotFound />,
  defaultPendingComponent: () => (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loading.Dots />
    </div>
  ),
})

fathom.init(router)

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

async function start(): Promise<void> {
  if (keygen.config.isDemo) {
    const demo = await import("@/demo")
    demo.boot()
  }

  const rootElement = document.getElementById("root")!

  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement, {
      onCaughtError: (error) => {
        if (isNotFound(error) || isRedirect(error) || isReloadingStaleBuild) {
          return
        }
        console.error(error)
      },
    })

    root.render(
      <StrictMode>
        <Sentry.ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            storageKey="keygen.theme"
            disableTransitionOnChange
          >
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </ThemeProvider>
        </Sentry.ErrorBoundary>
      </StrictMode>,
    )
  }
}

void start()
