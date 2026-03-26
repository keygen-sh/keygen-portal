import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import {
  Artifact,
  ArtifactStatusLabels,
  ArtifactStatusVariants,
} from "@/types/artifacts"

import { formatFileSize } from "@/lib/artifacts"
import { createTableColumnHelper } from "@/lib/tables"

import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Artifact>()

export function useArtifactTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("filename", {
        header: "Filename",
      }),
      column.attr("filetype", {
        header: "Filetype",
        cell: (info) => info.getValue() ?? "--",
      }),
      column.attr("filesize", {
        header: "Filesize",
        cell: (info) => formatFileSize(info.getValue()),
      }),
      column.attr("platform", {
        header: "Platform",
        cell: (info) => info.getValue() ?? "--",
      }),
      column.attr("arch", {
        header: "Arch",
        cell: (info) => info.getValue() ?? "--",
      }),
      column.attr("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue()
          return (
            <Badge variant={ArtifactStatusVariants[status]}>
              {ArtifactStatusLabels[status]}
            </Badge>
          )
        },
      }),
      column.attr("created", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
      column.attr("updated", {
        header: "Updated",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
    ],
    [],
  )

  return columns
}
