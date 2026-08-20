import { Button } from "@/components/ui/button"

import SidebarNoticeCard from "./card"

type SidebarNoticeNewVersionProps = {
  onReload: () => void
}

export default function SidebarNoticeNewVersion({
  onReload,
}: SidebarNoticeNewVersionProps) {
  return (
    <SidebarNoticeCard
      title="A new version is available"
      description="Refresh the page for the latest Portal updates."
    >
      <Button size="sm" onClick={onReload}>
        Refresh
      </Button>
    </SidebarNoticeCard>
  )
}
