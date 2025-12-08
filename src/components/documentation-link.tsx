import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

type DocumentationPage =
  | ""
  | "environments"
  | "products"
  | "entitlements"
  | "groups"
  | "policies"
  | "users"
  | "licenses"
  | "machines"
  | "components"
  | "processes"

interface DocumentationLinkProps {
  page?: DocumentationPage
  section?: string
  message?: string
  className?: string
  children?: React.ReactNode
}

export default function DocumentationLink({
  page = "",
  section = "",
  message = "",
  className,
  children,
}: DocumentationLinkProps): React.ReactElement {
  return (
    <p
      className={cn(
        "mx-6 my-4 hidden flex-wrap items-center gap-1 text-sm text-content-subdued md:flex",
        className,
      )}
    >
      {message || `To learn more about ${page || "Keygen"}, see the `}
      <Button asChild variant="link" size="link">
        <a
          href={`https://keygen.sh/docs/api/${page && `${page}/`}${page && section && `#${section}/`}`}
          target="_blank"
          rel="noreferrer"
        >
          {children || "documentation"}
        </a>
      </Button>
      {!message && " for more information."}
    </p>
  )
}
