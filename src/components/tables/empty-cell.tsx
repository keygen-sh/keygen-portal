import { Badge } from "@/components/ui/badge"

interface EmptyCellProps {
  label?: string
}

export default function EmptyCell({
  label = "Not set",
}: EmptyCellProps): React.ReactElement {
  return <Badge variant="disabled">{label}</Badge>
}
