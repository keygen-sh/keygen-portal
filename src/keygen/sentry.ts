import * as Sentry from "@sentry/react"
import config from "@/keygen/config"

function init(): void {
  const { dsn, environment } = config.sentry

  if (!dsn) {
    return
  }

  Sentry.init({
    dsn,
    environment,
    release: __APP_VERSION__,
    integrations: [Sentry.browserTracingIntegration()],
  })
}

export default { init }
