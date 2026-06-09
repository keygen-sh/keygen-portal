import {
  HTTP_STATUS_CODES,
  type RequestLogAttributes,
} from "@/types/request-logs"

export function requestLogMethodBadgeVariant(
  method: string,
): "secondary" | "success" | "warning" | "destructive" {
  switch (method.toUpperCase()) {
    case "POST":
      return "success"
    case "PUT":
    case "PATCH":
      return "warning"
    case "DELETE":
      return "destructive"
    default:
      return "secondary"
  }
}

export function requestLogStatusBadgeVariant(
  status: string,
): "secondary" | "success" | "warning" | "destructive" {
  const code = Number(status)
  if (Number.isNaN(code)) return "secondary"
  if (code >= 500) return "destructive"
  if (code >= 400) return "warning"
  if (code >= 200 && code < 300) return "success"
  return "secondary"
}

export function requestLogStatusText(status: string): string | undefined {
  return HTTP_STATUS_CODES.find((entry) => entry.code === status)?.text
}

// attempts to parse string as JSON, but falls back to original
// string if parsing fails or if value is falsy
function parseBody(value: string | null | undefined): unknown {
  if (value == null || value === "") return null

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function formatRequestLogRequest(
  attributes: RequestLogAttributes,
): string {
  return JSON.stringify(
    {
      method: attributes.method,
      url: attributes.url,
      ip: attributes.ip,
      userAgent: attributes.userAgent,
      headers: attributes.requestHeaders ?? {},
      body: parseBody(attributes.requestBody),
    },
    null,
    2,
  )
}

export function formatRequestLogResponse(
  attributes: RequestLogAttributes,
): string {
  return JSON.stringify(
    {
      status: attributes.status,
      headers: attributes.responseHeaders ?? {},
      body: parseBody(attributes.responseBody),
      signature: attributes.responseSignature ?? null,
    },
    null,
    2,
  )
}
