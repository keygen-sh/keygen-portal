import { documentTitle } from "@/lib/document-title"

export default function DocumentTitle({ title }: { title?: string | null }) {
  return <title>{documentTitle(title)}</title>
}
