import { useQuery } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as keygen from "@/keygen"

export function useSearch(
  type: "users" | "licenses" | "machines" | "groups" | null,
  query: Record<string, string>,
  op?: "AND" | "OR",
) {
  const { code } = useEnvironment()
  const enabled =
    type != null && Object.values(query).some((v) => v.length >= 3)

  return useQuery({
    queryKey: ["search", type, query, { environment: code }],
    queryFn: () =>
      keygen
        .search({ type: type!, query, op })
        .then((response) => response.data ?? []),
    enabled,
  })
}
