import { defineConfig, loadEnv, type PluginOption } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { execSync } from "node:child_process"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import { sentryVitePlugin } from "@sentry/vite-plugin"

function resolveAppVersion(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
  } catch {
    return String(Date.now())
  }
}

function appVersion(version: string): PluginOption {
  return {
    name: "app-version",
    config: () => ({
      define: { __APP_VERSION__: JSON.stringify(version) },
    }),
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ version }),
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const version = resolveAppVersion()

  // for source map upload to BetterStack
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: env.VITE_ALLOWED_HOSTS
        ? env.VITE_ALLOWED_HOSTS.split(",").map((host) => host.trim())
        : [],
    },
    build: {
      sourcemap: sentryAuthToken ? "hidden" : false,
    },
    plugins: [
      appVersion(version),
      TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
      tsconfigPaths(),
      tailwindcss(),
      react(),
      svgr(),
      ...(sentryAuthToken
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              url: env.SENTRY_URL,
              authToken: sentryAuthToken,
              telemetry: false,
              release: { name: version },
              sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
            }),
          ]
        : []),
    ],
  }
})
