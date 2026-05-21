import { CommandGroup, CommandItem } from "@/components/ui/command"

import { Copy, LogOut } from "lucide-react"

export interface FooterProps {
  onCopyAccountId: () => void
  onSignOut: () => void
}

export default function Footer({ onCopyAccountId, onSignOut }: FooterProps) {
  return (
    <div className="border-t bg-popover" data-slot="command-footer">
      <CommandGroup forceMount>
        <CommandItem
          value="footer:copy-id"
          forceMount
          tabbable
          onSelect={onCopyAccountId}
        >
          <Copy />
          <span>Copy account ID</span>
        </CommandItem>
        <CommandItem
          value="footer:sign-out"
          forceMount
          tabbable
          onSelect={onSignOut}
        >
          <LogOut />
          <span>Sign out</span>
        </CommandItem>
      </CommandGroup>
    </div>
  )
}
