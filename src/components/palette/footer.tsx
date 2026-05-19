import { Copy, LogOut } from "lucide-react"

import { CommandGroup, CommandItem } from "@/components/ui/command"

import { copyToClipboard } from "@/lib/clipboard"

import { useLogout } from "@/queries/auth"

import * as keygen from "@/keygen"

export interface FooterProps {
  onClose: () => void
}

export default function Footer({ onClose }: FooterProps) {
  const logout = useLogout()

  async function handleCopyAccountId() {
    await copyToClipboard(keygen.config.id)
    onClose()
  }

  function handleSignOut() {
    onClose()
    logout.mutate()
  }

  return (
    <div className="border-t bg-popover" data-slot="command-footer">
      <CommandGroup forceMount>
        <CommandItem
          value="account:copy-id"
          forceMount
          onSelect={handleCopyAccountId}
        >
          <Copy />
          <span>Copy account ID</span>
        </CommandItem>
        <CommandItem
          value="account:sign-out"
          forceMount
          onSelect={handleSignOut}
        >
          <LogOut />
          <span>Sign out</span>
        </CommandItem>
      </CommandGroup>
    </div>
  )
}
