
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { Resource } from "@/types/api"

export function createResourceColumnHelper<T extends Resource<any, any, any>>() {
  const helper = createColumnHelper<T>()

  return {
    id(
      def: Omit<ColumnDef<T, T["id"]>, "accessorKey" | "accessorFn"> = {},
    ): ColumnDef<T, T["id"]> {
      return helper.accessor(row => row.id, { id: "id", ...def })
    },
    attr<K extends keyof T["attributes"]>(
      key: K,
      def: Omit<ColumnDef<T, T["attributes"][K]>, "accessorKey" | "accessorFn"> = {},
    ): ColumnDef<T, T["attributes"][K]> {
      return helper.accessor(row => row.attributes[key], {
        id: `attributes.${String(key)}`,
        ...def,
      })
    },
    rel<K extends keyof T["relationships"]>(
      key: K,
      def: Omit<ColumnDef<T, T["relationships"][K]>, "accessorKey" | "accessorFn"> = {},
    ): ColumnDef<T, T["relationships"][K]> {
      return helper.accessor(row => row.relationships[key], {
        id: `relationships.${String(key)}`,
        ...def,
      })
    },
  }
}
