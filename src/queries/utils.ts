import { type QueryKey } from "@tanstack/react-query"

import { partitionFulfilled } from "@/lib/partition"
import { APIError } from "@/types/api"

// similar to Tanstack's keepPreviousData except it keeps previous data during pagination
// but clears it when filters change (so the loading skeleton is shown immediately)
export function keepPreviousDataUnlessRefiltered<T>(nextFilters: unknown) {
  return (
    prevData: T | undefined,
    prevQuery: { queryKey: QueryKey } | undefined,
  ) => {
    const prevKey = prevQuery?.queryKey ?? []
    const lastKey = prevKey[prevKey.length - 1] // query options e.g. env, filters, etc.

    if (typeof lastKey === "object" && "filters" in lastKey!) {
      const prevFilters = lastKey.filters
      const filtersChanged =
        JSON.stringify(prevFilters) !== JSON.stringify(nextFilters)

      return filtersChanged ? undefined : prevData
    }

    return prevData
  }
}

// wrap error with an additional index property to make retries easier
export type MutationError = { reason: APIError; index: number }
export type MutationPartition<T> = [T[], MutationError[]]

// partition helper for query mutations
export function partitionSettledMutations<T>(
  results: PromiseSettledResult<T>[],
): MutationPartition<T> {
  const [succeeded, failed] = partitionFulfilled<T, APIError>(results)

  return [
    succeeded.map((r) => r.value),
    failed.map((r) => ({ reason: r.reason, index: results.indexOf(r) })),
  ] as MutationPartition<T>
}

// settles and partitions an array of inflight mutations
export async function settleMutations<T>(
  mutations: Promise<T>[],
): Promise<MutationPartition<T>> {
  const results = await Promise.allSettled(mutations)

  return partitionSettledMutations(results)
}
