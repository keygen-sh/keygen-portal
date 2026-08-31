export const APP_NAME = "Keygen Portal"

// formats a browser tab title with the app name
// e.g. "License | Keygen Portal"
export function documentTitle(title?: string | null): string {
  return title ? `${title} | ${APP_NAME}` : APP_NAME
}

// sets the document title in a component's head meta tags
// e.g. { meta: [{ title: "License | Keygen Portal" }] }
export function titleHead(title: string) {
  return () => ({ meta: [{ title: documentTitle(title) }] })
}

// extracts the page title from a tab/document title
// e.g. "License | Keygen Portal" to "License"
export function pageTitle(title: string): string | null {
  if (title === APP_NAME) return null
  const suffix = ` | ${APP_NAME}`
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title
}
