import { documentTitle } from "@/lib/document-title"

import { useSyncFavoritePageLabel } from "@/hooks/use-favorites"

export default function DocumentTitle({ title }: { title?: string | null }) {
  useSyncFavoritePageLabel(title)

  return <title>{documentTitle(title)}</title>
}
