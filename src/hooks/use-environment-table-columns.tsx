import { useMemo } from "react"

import { Environment } from "@/types/environments"
import { createTableColumnHelper } from "@/lib/tables"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Environment>()

export function useEnvironmentTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
      }),
      column.attr("code", {
        header: "Code",
      }),
      column.attr("isolationStrategy", {
        header: "Isolation Strategy",
      }),
    ],
    [],
  )

  return columns
}
