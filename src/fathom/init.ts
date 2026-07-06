import * as Fathom from "fathom-client"
import type { AnyRouter } from "@tanstack/react-router"

import * as keygen from "@/keygen"

export default function init(router: AnyRouter): void {
  const { siteId } = keygen.config.fathom

  if (!siteId) {
    return
  }

  Fathom.load(siteId, { auto: false })

  router.subscribe("onResolved", ({ hrefChanged }) => {
    if (hrefChanged) {
      Fathom.trackPageview()
    }
  })
}
