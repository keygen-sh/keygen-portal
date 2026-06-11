export function formatEventPayload(payload: string | null): string {
  if (payload == null || payload === "") return ""

  try {
    return JSON.stringify(JSON.parse(payload), null, 2)
  } catch {
    return payload
  }
}
