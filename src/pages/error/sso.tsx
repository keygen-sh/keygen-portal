import { Link, useSearch } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ErrorShell from "@/components/error-shell"

import * as keygen from "@/keygen"

export default function SSOError() {
  const { code } = useSearch({ from: "/sso/error" })

  return (
    <ErrorShell>
      <div className="flex flex-col">
        <div className="w-full border-b border-accent p-4">
          <h1 className="font-owners-wide text-xl">Single sign-on error</h1>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <p className="text-content-muted">
            An error occurred during sign-in.
          </p>
          {code && (
            <p className="text-xs text-content-subdued">
              Error: <Badge>{code}</Badge>
            </p>
          )}
          {keygen.config.supportEmail && (
            <p className="text-xs text-content-subdued">
              If this error is unexpected, and the problem persists, please{" "}
              <a
                href={`mailto:${keygen.config.supportEmail}`}
                className="text-secondary underline transition-colors duration-200 hover:text-content-loud"
              >
                reach out
              </a>
              {keygen.config.isCloud
                ? " to connect with a Keygen engineer."
                : " for support."}
            </p>
          )}
        </div>
        <div className="flex w-full justify-end border-t border-accent p-4">
          <Button asChild size="lg" className="w-full md:w-48">
            <Link
              to="/$accountId/auth/login"
              params={{ accountId: keygen.config.id }}
            >
              Back to login
            </Link>
          </Button>
        </div>
      </div>
    </ErrorShell>
  )
}
