import { useQuery } from "@tanstack/react-query"

import {
  SearchOperator,
  type SearchQuery,
  SearchableResource,
} from "@/types/search"

import { useEnvironment } from "@/hooks/use-environment"

import { MIN_SEARCH_LENGTH } from "@/lib/palette"

import * as keygen from "@/keygen"

export function useSearch(
  type: SearchableResource | null,
  query: SearchQuery,
  op?: SearchOperator,
) {
  const { code } = useEnvironment()
  const enabled =
    type != null &&
    Object.values(query).some(
      (v) => typeof v === "string" && v.length >= MIN_SEARCH_LENGTH,
    )

  return useQuery({
    queryKey: ["search", type, query, op, { environment: code }],
    queryFn: () =>
      keygen
        .search({ type: type!, query, op })
        .then((response) => response.data ?? []),
    enabled,
  })
}
