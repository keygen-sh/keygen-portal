export function httpMethodBadgeVariant(
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

export function httpStatusBadgeVariant(
  status: string | number,
): "secondary" | "success" | "warning" | "destructive" {
  const code = Number(status)
  if (Number.isNaN(code)) return "secondary"
  if (code >= 500) return "destructive"
  if (code >= 400) return "warning"
  if (code >= 200 && code < 300) return "success"
  return "secondary"
}
