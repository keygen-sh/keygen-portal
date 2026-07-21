export const APP_NAME = "Keygen Portal"

// Formats a browser tab title with the app name
// e.g. "License | Keygen Portal"
export function documentTitle(title?: string | null): string {
  return title ? `${title} | ${APP_NAME}` : APP_NAME
}

// Used to set the document title in a component's head meta tags
// e.g. { meta: [{ title: "License | Keygen Portal" }] }
export function titleHead(title: string) {
  return () => ({ meta: [{ title: documentTitle(title) }] })
}
