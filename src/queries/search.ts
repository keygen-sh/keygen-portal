import { useQuery } from "@tanstack/react-query"

import { SearchableResource } from "@/types/search"

import { useEnvironment } from "@/hooks/use-environment"

import * as keygen from "@/keygen"

export function useSearch(
  type: SearchableResource | null,
  query: Record<string, string>,
  op?: "AND" | "OR",
) {
  const { code } = useEnvironment()
  const enabled =
    type != null && Object.values(query).some((v) => v.length >= 3)

  return useQuery({
    queryKey: ["search", type, query, op, { environment: code }],
    queryFn: () =>
      keygen
        .search({ type: type!, query, op })
        .then((response) => response.data ?? []),
    enabled,
  })
}
