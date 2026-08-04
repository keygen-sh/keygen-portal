import { type Linkage } from "@/types/api"

import ClipboardButton from "@/components/clipboard-button"

import EnvironmentCell from "./environment-cell"
import LicenseCell from "./license-cell"
import ProductCell from "./product-cell"
import ResourceCell from "./resource-cell"
import UserCell from "./user-cell"

const POLYMORPHIC_BEARER_CELLS: Readonly<
  Record<string, (props: { id: string | undefined }) => React.ReactElement>
> = {
  users: UserCell,
  licenses: LicenseCell,
  products: ProductCell,
  environments: EnvironmentCell,
}

interface PolymorphicBearerCellProps {
  linkage: Linkage | null | undefined
}

export default function PolymorphicBearerCell({
  linkage,
}: PolymorphicBearerCellProps): React.ReactElement {
  if (!linkage) return <ResourceCell isEmpty />

  const Cell = POLYMORPHIC_BEARER_CELLS[linkage.type]

  if (!Cell) return <ClipboardButton value={linkage.id} maxLength={8} />

  return <Cell id={linkage.id} />
}
