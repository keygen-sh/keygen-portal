import * as Sentry from "@sentry/react"
import * as keygen from "@/keygen"

export default function init(): void {
  const { dsn, environment } = keygen.config.sentry

  if (!dsn) {
    return
  }

  Sentry.init({
    dsn,
    environment,
    release: __APP_VERSION__,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.captureConsoleIntegration({ levels: ["error"] }),
    ],
  })
}
