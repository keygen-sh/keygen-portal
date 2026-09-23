import type { MockContext } from "./context"
import { mockStore } from "./store"
import type { MockResource, MockRow } from "./types"

export type MockSerializer = (ctx: MockContext, row: MockRow) => MockResource
export type MockDestroyer = (ctx: MockContext | null, row: MockRow) => void

const serializers = new Map<string, MockSerializer>()
const destroyers = new Map<string, MockDestroyer>()

export function registerMockSerializer(
  type: string,
  serializer: MockSerializer,
): void {
  serializers.set(type, serializer)
}

export function serializeMock(ctx: MockContext, row: MockRow): MockResource {
  const serializer = serializers.get(row.type)
  if (!serializer) {
    throw new Error(`No serializer registered for '${row.type}'`)
  }
  return serializer(ctx, row)
}

export function hasMockSerializer(type: string): boolean {
  return serializers.has(type)
}

export function registerMockDestroyer(
  type: string,
  destroyer: MockDestroyer,
): void {
  destroyers.set(type, destroyer)
}

export function destroyMock(
  ctx: MockContext | null,
  type: string,
  id: string,
): void {
  const row = mockStore.table(type).get(id)
  if (!row) return

  const destroyer = destroyers.get(type)
  if (destroyer) {
    destroyer(ctx, row)
  } else {
    mockStore.table(type).delete(id)
  }
}

export function destroyMockWhere(
  ctx: MockContext | null,
  type: string,
  predicate: (row: MockRow) => boolean,
): void {
  for (const row of mockStore.table(type).where(predicate)) {
    destroyMock(ctx, type, row.id)
  }
}
