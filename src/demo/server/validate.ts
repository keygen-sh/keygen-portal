import {
  attributeError,
  badRequest,
  fail,
  unpermittedAttribute,
  unprocessable,
} from "./errors"
import type { MockResult } from "./types"
import { receivedType } from "./values"

export function typeMismatch(
  pointer: string,
  value: unknown,
  expected: string,
): MockResult {
  return badRequest(
    `type mismatch (received ${receivedType(value)} expected ${expected})`,
    { pointer },
  )
}

export function failTypeMismatch(
  attribute: string,
  received: unknown,
  expected: string,
): never {
  fail(typeMismatch(`/data/attributes/${attribute}`, received, expected))
}

export function failTooLong(attribute: string, maximum: number): never {
  fail(
    unprocessable(
      attributeError(
        attribute,
        "TOO_LONG",
        `is too long (maximum is ${maximum} characters)`,
      ),
    ),
  )
}

export function rejectAttribute(
  attribute: string,
  kind: string,
  detail: string,
): never {
  fail(unprocessable(attributeError(attribute, kind, detail)))
}

export function rejectUnpermitted(
  attributes: Record<string, unknown>,
  permitted: readonly string[],
): void {
  for (const key of Object.keys(attributes)) {
    if (!permitted.includes(key)) fail(unpermittedAttribute(key))
  }
}
