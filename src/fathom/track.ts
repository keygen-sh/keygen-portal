import * as Fathom from "fathom-client"
import * as keygen from "@/keygen"

export default function track(event: string): void {
  const { siteId } = keygen.config.fathom

  if (!siteId) {
    return
  }

  Fathom.trackEvent(event)
}
