import { Button } from "@/components/ui/button"

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
  linkText?: string
}

export default function DocumentationLink({
  page = "",
  section = "",
  message = "",
  linkText = "",
}: DocumentationLinkProps): React.ReactElement {
  return (
    <p className="mx-6 my-4 hidden flex-wrap items-center gap-1 text-sm text-content-subdued md:flex">
      {message || `To learn more about ${page || "Keygen"}, see the `}
      <Button asChild variant="link" size="link">
        <a
          href={`https://keygen.sh/docs/api/${page && `${page}/`}${page && section && `#${section}/`}`}
          target="_blank"
          rel="noreferrer"
        >
          {linkText || "documentation"}
        </a>
      </Button>
      {message ? "." : " for more information."}
    </p>
  )
}
