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
}

export default function DocumentationLink({
  page = "",
  section = "",
}: DocumentationLinkProps): React.ReactElement {
  return (
    <p className="mx-6 my-4 hidden flex-wrap items-center gap-1 text-sm text-content-subdued md:flex">
      To learn more about {page || "Keygen"}, see the{" "}
      <Button asChild variant="link" size="link">
        <a
          href={`https://keygen.sh/docs/api/${page && `${page}/`}${page && section && `#${section}/`}`}
          target="_blank"
          rel="noreferrer"
        >
          documentation
        </a>
      </Button>{" "}
      for more information.
    </p>
  )
}
