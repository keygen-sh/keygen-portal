import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { useListTokens } from "@/queries/tokens"

import { Token, TokenKindLabels, InternalTokenRoles } from "@/types/tokens"

import * as Tokens from "@/components/tokens"
import Can from "@/components/can"
import ClipboardButton from "@/components/clipboard-button"

const PREVIEW_COUNT = 10

export default function InternalTokensPage() {
  const navigateToResource = useResourceNavigate()

  const { data: internalTokens, isLoading } = useListTokens({
    pageSize: 100,
    filters: { bearerRoles: [...InternalTokenRoles] },
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [viewAllOpen, setViewAllOpen] = useState(false)

  const handleNavigate = async (token: Token) => {
    setViewAllOpen(false)
    await navigateToResource(token)
  }

  const preview = internalTokens.slice(0, PREVIEW_COUNT)
  const remaining = internalTokens.length - preview.length

  return (
    <div className="overflow-hidden rounded bg-background-1">
      <Can permission="token.generate">
        <div className="flex items-center justify-end border-b border-accent p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="border-none bg-background-2"
          >
            New Token
          </Button>
        </div>
      </Can>

      <div className="flex flex-col">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : internalTokens.length === 0 ? (
          <span className="p-4 text-sm text-content-subdued">
            No internal access tokens yet. Create one to start integrating with
            the Keygen API.
          </span>
        ) : (
          <>
            <ScrollArea className="h-80">
              {preview.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  onNavigate={handleNavigate}
                />
              ))}
            </ScrollArea>
            {remaining > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setViewAllOpen(true)}
                className="h-12 rounded-t-none border-t border-accent text-sm text-primary transition-colors hover:bg-background-2"
              >
                View all tokens
              </Button>
            )}
          </>
        )}
      </div>

      <Tokens.Form.Create open={createOpen} onOpenChange={setCreateOpen} />

      <Tokens.Dialog.Internal
        open={viewAllOpen}
        onOpenChange={setViewAllOpen}
      />
    </div>
  )
}

interface TokenRowProps {
  token: Token
  onNavigate: (token: Token) => void
}

function TokenRow({ token, onNavigate }: TokenRowProps) {
  return (
    <div
      onClick={() => onNavigate(token)}
      className="flex cursor-pointer items-center gap-3 border-b border-accent p-3 transition-colors last:border-b-0 hover:bg-background-2"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-content-loud">
            {token.attributes.name || (
              <span className="flex items-center font-normal text-content-disabled">
                {"(name not set)"}
              </span>
            )}
          </span>
          <Badge variant="secondary" className="px-1 text-xs">
            {TokenKindLabels[token.attributes.kind] ?? token.attributes.kind}
          </Badge>
        </div>
        <span className="text-xs text-content-subdued">
          {token.attributes.expiry
            ? `Expires ${new Date(token.attributes.expiry).toLocaleDateString()}`
            : "Never expires"}
        </span>
      </div>

      <ClipboardButton value={token.id} className="w-fit text-sm" />
    </div>
  )
}
