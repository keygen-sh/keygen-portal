import { useForm } from "react-hook-form"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import * as keygen from "@/keygen"

import * as Schemas from "@/schemas"

import * as Auth from "@/components/auth"
import * as Forms from "@/components/forms"
import { Notice } from "@/components/notice"

interface EnvironmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EnvironmentDialog({
  open,
  onOpenChange,
}: EnvironmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader className="gap-1 border-b border-accent p-4 text-start">
          <DialogTitle className="sr-only text-base">Environment</DialogTitle>
          <DialogDescription>
            Sign in to a specific environment
          </DialogDescription>
        </DialogHeader>
        <EnvironmentForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EnvironmentForm({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate()
  const { env } = useSearch({ from: "/$accountId/auth/login" })

  const form = useForm<Schemas.Auth.EnvironmentValues>({
    resolver: zodResolver(Schemas.Auth.EnvironmentSchema),
    mode: "onChange",
    defaultValues: { environment: env ?? "" },
  })

  function select(environment: string) {
    void navigate({
      to: "/$accountId/auth/login",
      params: { accountId: keygen.config.id },
      search: (prev) => ({ ...prev, env: environment || undefined }),
    })

    onDone()
  }

  return (
    <Forms.Provider form={form} guard={false}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(({ environment }) => select(environment))(e)
        }}
        noValidate
      >
        <div className="flex flex-col gap-4 p-4">
          <Auth.Form.Fields include={["environment"]} autoFocus="environment" />
          <Notice>
            <p>
              Environment codes are case-sensitive. If you are unsure of your
              environment code or ID, please check with your administrator.
            </p>
          </Notice>
        </div>
        <DialogFooter className="gap-4 border-t border-accent p-4">
          <Button type="submit">Switch</Button>
        </DialogFooter>
      </form>
    </Forms.Provider>
  )
}
