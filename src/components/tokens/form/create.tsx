import { useState, type ReactNode } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { ShieldCheck, User, KeyRound, Box, Layers } from "lucide-react"

import * as Schemas from "@/schemas"
import { TokenBearerKind, TokenBearerKindLabels } from "@/types/tokens"

import { useCreateToken } from "@/queries/tokens"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Tokens from "@/components/tokens"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

const BEARER_KIND_BADGE_ICONS: Record<TokenBearerKind, ReactNode> = {
  [TokenBearerKind.Admin]: <ShieldCheck />,
  [TokenBearerKind.User]: <User />,
  [TokenBearerKind.License]: <KeyRound />,
  [TokenBearerKind.Product]: <Box />,
  [TokenBearerKind.Environment]: <Layers />,
}

const ATTRIBUTE_FIELDS = [
  "name",
  "expiry",
  "maxActivations",
  "maxDeactivations",
  "permissions",
  "bearerId",
]

interface CreateTokenFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fixedBearerKind?: TokenBearerKind
}

export default function CreateTokenForm({
  open,
  onOpenChange,
  fixedBearerKind,
}: CreateTokenFormProps) {
  const [secret, setSecret] = useState<string | null>(null)
  const createToken = useCreateToken()

  const defaultValues: Schemas.Tokens.CreateFormValues = {
    bearerKind: fixedBearerKind ?? TokenBearerKind.Admin,
    bearerId: null,
    name: "",
    expiry: null,
    maxActivations: null,
    maxDeactivations: null,
    permissions: null,
  }

  const form = useForm<
    Schemas.Tokens.CreateFormValues,
    unknown,
    Schemas.Tokens.CreateValues
  >({
    resolver: zodResolver(Schemas.Tokens.CreateSchema),
    mode: "onChange",
    defaultValues,
  })

  const bearerKind = useWatch({ control: form.control, name: "bearerKind" })

  const handleSubmit = async (values: Schemas.Tokens.CreateValues) => {
    const token = await createToken.mutateAsync(values)

    toast({ message: "Token created", variant: "success" })
    form.reset(defaultValues)
    setSecret(token.attributes.token ?? null)
  }

  return (
    <>
      <Forms.Provider form={form}>
        <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
          <Forms.Layout.Wizard
            onSubmit={handleSubmit}
            isPending={createToken.isPending}
            submitLabel="Create Token"
            description={
              <BadgeGroup prefix="Creating a new" suffix="token">
                <BadgeGroupItem>
                  {BEARER_KIND_BADGE_ICONS[bearerKind]}
                  {TokenBearerKindLabels[bearerKind]}
                </BadgeGroupItem>
              </BadgeGroup>
            }
            errorMessage="Failed to create token"
          >
            {fixedBearerKind == null && (
              <Forms.Section.Step crumb="Bearer type" fields={["bearerKind"]}>
                <Tokens.Form.Fields include={["bearerKind"]} />
              </Forms.Section.Step>
            )}

            <Forms.Section.Step crumb="Attributes" fields={ATTRIBUTE_FIELDS}>
              <Forms.Field.Title>
                <Tokens.Form.Fields
                  include={["name"]}
                  titleVariant
                  autoFocus="name"
                />
              </Forms.Field.Title>

              <Forms.Section.Card title="Attributes">
                <Forms.Section.Columns>
                  <Forms.Section.Column>
                    <Tokens.Form.Fields
                      include={
                        bearerKind === TokenBearerKind.License
                          ? ["bearerId", "expiry"]
                          : ["bearerId"]
                      }
                    />
                  </Forms.Section.Column>
                  <Forms.Section.Column>
                    <Tokens.Form.Fields
                      include={
                        bearerKind === TokenBearerKind.License
                          ? ["maxActivations", "maxDeactivations"]
                          : ["expiry"]
                      }
                    />
                  </Forms.Section.Column>
                </Forms.Section.Columns>
                <Tokens.Form.Fields include={["permissions"]} />
              </Forms.Section.Card>
            </Forms.Section.Step>
          </Forms.Layout.Wizard>
        </Forms.Container.Dialog>
      </Forms.Provider>

      <Tokens.Dialog.Secret secret={secret} onClose={() => setSecret(null)} />
    </>
  )
}
