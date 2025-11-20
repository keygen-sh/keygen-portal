import { partitionFulfilled } from "@/lib/partition"
import { APIError } from "@/types/api"

// wrap error with an additional index property to make retries easier
export type MutationError = { reason: APIError, index: number }
export type MutationPartition<T> = [T[], MutationError[]]

// partition helper for query mutations
export function partitionMutations<T>(results: PromiseSettledResult<T>[]): MutationPartition<T> {
  const [succeeded, failed] = partitionFulfilled<T, APIError>(results)

  return [
    succeeded.map(r => r.value),
    failed.map(r => ({ reason: r.reason, index: results.indexOf(r) })),
  ] as MutationPartition<T>
}
