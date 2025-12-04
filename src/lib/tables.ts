import { ColumnDef, createColumnHelper } from "@tanstack/react-table"

export type TableResource = {
  id: string
  attributes: Record<PropertyKey, unknown>
  relationships: Record<PropertyKey, unknown>
}

export type TableColumns<T extends TableResource> = (
  | ColumnDef<T, T["id"]>
  | {
      [K in keyof T["attributes"]]: ColumnDef<T, T["attributes"][K]>
    }[keyof T["attributes"]]
  | {
      [K in keyof T["relationships"]]: ColumnDef<T, T["relationships"][K]>
    }[keyof T["relationships"]]
)[]

export function createTableColumnHelper<T extends TableResource>() {
  const helper = createColumnHelper<T>()

  return {
    id(
      def: Omit<ColumnDef<T, T["id"]>, "accessorKey" | "accessorFn"> = {},
    ): ColumnDef<T, T["id"]> {
      return helper.accessor((row) => row.id, { id: "id", ...def })
    },
    attr<K extends PropertyKey & keyof T["attributes"]>(
      key: K,
      def: Omit<
        ColumnDef<T, T["attributes"][K]>,
        "accessorKey" | "accessorFn"
      > = {},
    ): ColumnDef<T, T["attributes"][K]> {
      return helper.accessor((row) => row.attributes[key], {
        id: `attributes.${String(key)}`,
        ...def,
      })
    },
    rel<K extends PropertyKey & keyof T["relationships"]>(
      key: K,
      def: Omit<
        ColumnDef<T, T["relationships"][K]>,
        "accessorKey" | "accessorFn"
      > = {},
    ): ColumnDef<T, T["relationships"][K]> {
      return helper.accessor((row) => row.relationships[key], {
        id: `relationships.${String(key)}`,
        ...def,
      })
    },
  }
}
