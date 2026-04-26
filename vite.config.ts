import { defineConfig, type PluginOption } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { execSync } from "node:child_process"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

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

function appVersion(): PluginOption {
  const version = resolveAppVersion()
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

export default defineConfig({
  plugins: [
    appVersion(),
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    tsconfigPaths(),
    tailwindcss(),
    react(),
    svgr(),
  ],
})
