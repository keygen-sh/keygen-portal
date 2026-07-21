import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import ErrorShell from "@/components/error-shell"
import DocumentTitle from "@/components/document-title"

import { getRecentAccounts } from "@/lib/accounts"

import * as keygen from "@/keygen"

export default function NotFound() {
  const recentAccounts = getRecentAccounts()
  const slug = keygen.config.id
  const dashboardAccountId = keygen.config.hasFixedAccount
    ? slug
    : (recentAccounts.find((a) => a.id === slug || a.slug === slug)?.id ??
      recentAccounts[0]?.id)

  return (
    <ErrorShell>
      <DocumentTitle title="Page not found" />
      <div className="flex flex-col">
        <div className="w-full border-b border-accent p-4">
          <h1 className="font-owners-wide text-xl">Error 404</h1>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <p className="text-content-muted">
            The page or resource you were looking for could not be found.
          </p>
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
          {dashboardAccountId ? (
            <Button asChild size="lg" className="w-full md:w-48">
              <Link
                to="/$accountId/app/dashboard"
                params={{ accountId: dashboardAccountId }}
              >
                Go to dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="w-full md:w-48">
              <Link to="/">Go home</Link>
            </Button>
          )}
        </div>
      </div>
    </ErrorShell>
  )
}
