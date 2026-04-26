import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Props = {
  onReload: () => void
}

export default function NewVersionCard({ onReload }: Props) {
  return (
    <Card className="w-full items-start gap-4 rounded border-none p-4">
      <CardHeader className="w-full px-0">
        <CardTitle className="text-sm">A new version is available</CardTitle>
        <CardDescription className="text-xs">
          Refresh the page for the latest Portal updates.
        </CardDescription>
      </CardHeader>

      <CardFooter className="w-full px-0">
        <Button size="sm" onClick={onReload}>
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}
