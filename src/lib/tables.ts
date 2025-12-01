import { ColumnDef, createColumnHelper } from "@tanstack/react-table"

interface TableResource {
  id: string
  attributes: Record<string, unknown>
  relationships: Record<string, unknown>
}

export function createTableColumnHelper<T extends TableResource>() {
  const helper = createColumnHelper<T>()

  return {
    id(
      def: Omit<ColumnDef<T, T["id"]>, "accessorKey" | "accessorFn"> = {},
    ): ColumnDef<T, T["id"]> {
      return helper.accessor(row => row.id, { id: "id", ...def })
    },
    attr<K extends string & keyof T["attributes"]>(
      key: K,
      def: Omit<ColumnDef<T, T["attributes"][K]>, "accessorKey" | "accessorFn"> = {},
    ): ColumnDef<T, T["attributes"][K]> {
      return helper.accessor(row => row.attributes[key], {
        id: `attributes.${String(key)}`,
        ...def,
      })
    },
    rel<K extends string & keyof T["relationships"]>(
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
