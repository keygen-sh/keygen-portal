import { useSearch } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { useBackNavigate } from "@/hooks/use-back-navigate"

export default function GenericError() {
  const { code } = useSearch({ strict: false })
  const back = useBackNavigate()

  return (
    <div className="flex flex-col">
      <div className="w-full border-b border-accent p-4">
        <h1 className="font-owners-wide text-2xl font-semibold">Error 404</h1>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <p className="text-content-muted">
          Something went wrong. The requested page could not be located.
        </p>
        {code && (
          <p className="text-xs text-content-subdued">
            Error: <Badge>{code}</Badge>
          </p>
        )}
        <p className="text-xs text-content-subdued">
          If this error is unexpected, and the problem persists, please{" "}
          <a
            href="mailto:support@keygen.sh"
            className="text-secondary underline transition-colors duration-200 hover:text-content-loud"
          >
            reach out
          </a>{" "}
          to connect with a Keygen engineer.
        </p>
      </div>
      <div className="flex w-full justify-end border-t border-accent p-4">
        <Button size="lg" className="w-full md:w-48" onClick={() => back()}>
          Go back
        </Button>
      </div>
    </div>
  )
}
