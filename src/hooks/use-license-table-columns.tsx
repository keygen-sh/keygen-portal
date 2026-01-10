import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import {
  License,
  LicenseStatusLabels,
  LicenseStatusVariants,
} from "@/types/licenses"

import { createTableColumnHelper } from "@/lib/tables"

import PolicyCell from "@/components/tables/policy-cell"
import ProductCell from "@/components/tables/product-cell"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<License>()

export function useLicenseTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
        cell: (info) =>
          info.getValue() || <span className="text-content-muted">--</span>,
      }),
      column.attr("key", {
        header: "Key",
        cell: (info) => (
          <ClipboardButton
            value={info.getValue()}
            truncateStyle="middle"
            maxLength={12}
          />
        ),
      }),
      column.attr("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue()
          return (
            <Badge variant={LicenseStatusVariants[status]}>
              {LicenseStatusLabels[status]}
            </Badge>
          )
        },
      }),
      column.rel("policy", {
        sortingFn: "alphanumeric",
        header: "Policy",
        cell: (info) => <PolicyCell id={info.getValue()?.data?.id} />,
      }),
      column.rel("product", {
        sortingFn: "alphanumeric",
        header: "Product",
        cell: (info) => <ProductCell id={info.getValue()?.data?.id} />,
      }),
      column.attr("expiry", {
        sortingFn: "datetime",
        header: "Expiry",
        cell: (info) => {
          const value = info.getValue()
          if (!value) return <span className="text-content-muted">Never</span>
          return new Date(value).toLocaleDateString()
        },
      }),
      column.attr("created", {
        sortingFn: "datetime",
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    [],
  )

  return columns
}
