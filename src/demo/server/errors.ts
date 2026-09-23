import type { MockApiError, MockErrorSource, MockResult } from "./types"

export class HttpError extends Error {
  constructor(readonly result: MockResult) {
    super(
      (result.body as { errors?: MockApiError[] } | null | undefined)
        ?.errors?.[0]?.detail ?? `HTTP ${result.status}`,
    )
    this.name = "HttpError"
  }
}

export function fail(result: MockResult): never {
  throw new HttpError(result)
}

export function errors(
  status: number,
  list: MockApiError | MockApiError[],
): MockResult {
  return {
    status,
    body: { errors: Array.isArray(list) ? list : [list] },
  }
}

export function constantize(attribute: string): string {
  return attribute
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toUpperCase()
}

export function notFound(label: string, id: string): MockResult {
  return errors(404, {
    title: "Not found",
    detail: `The requested ${label} '${id}' was not found`,
    code: "NOT_FOUND",
  })
}

export function endpointNotFound(): MockResult {
  return errors(404, {
    title: "Not found",
    detail: "The requested endpoint was not found",
    code: "NOT_FOUND",
  })
}

export function badRequest(
  detail: string,
  source?: MockErrorSource,
): MockResult {
  return errors(400, { title: "Bad request", detail, source })
}

export function unauthorized(
  code: string,
  detail: string,
  source?: MockErrorSource,
): MockResult {
  return errors(401, { title: "Unauthorized", detail, code, source })
}

export function forbidden(
  detail: string = "You do not have permission to complete the request",
): MockResult {
  return errors(403, { title: "Access denied", detail })
}

export function unprocessable(list: MockApiError | MockApiError[]): MockResult {
  return errors(422, list)
}

export function attributeError(
  attribute: string,
  kind: string,
  detail: string,
): MockApiError {
  return {
    title: "Unprocessable resource",
    detail,
    code: `${constantize(attribute)}_${kind}`,
    source: { pointer: `/data/attributes/${attribute}` },
  }
}

export function relationshipError(
  relationship: string,
  kind: string,
  detail: string,
): MockApiError {
  return {
    title: "Unprocessable resource",
    detail,
    code: `${constantize(relationship)}_${kind}`,
    source: { pointer: `/data/relationships/${relationship}` },
  }
}

export function baseError(code: string, detail: string): MockApiError {
  return {
    title: "Unprocessable resource",
    detail,
    code,
    source: { pointer: "/data" },
  }
}

export function metaError(
  key: string,
  detail: string,
  code?: string,
  status: number = 422,
): MockResult {
  return errors(status, {
    title: status === 401 ? "Unauthorized" : "Unprocessable resource",
    detail,
    code,
    source: { pointer: `/meta/${key}` },
  })
}

export function missingAttribute(attribute: string): MockResult {
  return badRequest("is missing", { pointer: `/data/attributes/${attribute}` })
}

export function blankAttribute(attribute: string): MockResult {
  return badRequest("cannot be blank", {
    pointer: `/data/attributes/${attribute}`,
  })
}

export function unpermittedAttribute(attribute: string): MockResult {
  return badRequest("unpermitted parameter", {
    pointer: `/data/attributes/${attribute}`,
  })
}

export function invalidParameter(
  parameter: string,
  detail: string,
): MockResult {
  return badRequest(detail, { parameter })
}
