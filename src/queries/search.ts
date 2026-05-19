import { useQueries, useQuery } from "@tanstack/react-query"

import {
  SearchOperator,
  type SearchQuery,
  SearchableResource,
} from "@/types/search"
import type { AnyResource } from "@/types/api"

import { useEnvironment } from "@/hooks/use-environment"

import * as keygen from "@/keygen"

export function useSearch(
  type: SearchableResource | null,
  query: SearchQuery,
  op?: SearchOperator,
) {
  const { code } = useEnvironment()
  const enabled =
    type != null &&
    Object.values(query).some((v) => typeof v === "string" && v.length >= 3)

  return useQuery({
    queryKey: ["search", type, query, op, { environment: code }],
    queryFn: () =>
      keygen
        .search({ type: type!, query, op })
        .then((response) => response.data ?? []),
    enabled,
  })
}

interface SearchFanoutInput<R extends SearchableResource> {
  resource: R
  query: SearchQuery
  op?: SearchOperator
  enabled: boolean
}

interface SearchFanoutResult<R extends SearchableResource> {
  resource: R
  data: AnyResource[]
}

export function useSearchFanout<R extends SearchableResource>(
  inputs: SearchFanoutInput<R>[],
): { results: SearchFanoutResult<R>[]; isFetching: boolean } {
  const { code } = useEnvironment()

  const queries = useQueries({
    queries: inputs.map(({ resource, query, op, enabled }) => ({
      queryKey: ["search", resource, query, op, { environment: code }],
      queryFn: () =>
        keygen
          .search({ type: resource, query, op })
          .then((response) => response.data ?? []),
      enabled,
    })),
  })

  const isFetching = queries.some((q) => q.isFetching)
  const results = inputs.map((input, i) => ({
    resource: input.resource,
    data: queries[i].data ?? [],
  }))

  return { results, isFetching }
}
