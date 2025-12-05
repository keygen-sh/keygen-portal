// partition primitive to partition an array by a predicate function
export type Partition<T> = [T[], T[]]

export function partition<T>(
  values: T[],
  predicateFn: (v: T) => boolean,
): Partition<T> {
  return values.reduce(
    ([x, y], v): Partition<T> =>
      predicateFn(v) ? [[...x, v], y] : [x, [...y, v]],
    [[], []] as Partition<T>,
  )
}

// partition helper for Promise.allSettled result
export type PromiseRejectedResultWithReason<T> = Omit<
  PromiseRejectedResult,
  "reason"
> & { reason: T }

export type PromiseSettledPartition<
  FulfilledValue,
  RejectedReason = unknown,
> = [
  PromiseFulfilledResult<FulfilledValue>[],
  PromiseRejectedResultWithReason<RejectedReason>[],
]

export function partitionFulfilled<FulfilledValue, RejectedReason>(
  results: PromiseSettledResult<FulfilledValue>[],
): PromiseSettledPartition<FulfilledValue, RejectedReason> {
  return partition(
    results,
    (r) => r.status === "fulfilled",
  ) as PromiseSettledPartition<FulfilledValue, RejectedReason>
}
