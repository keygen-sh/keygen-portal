import { useState, type ReactNode } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { format, parseISO } from "date-fns"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import {
  X,
  Box,
  User,
  Layers,
  KeyRound,
  ShieldCheck,
  CalendarIcon,
} from "lucide-react"

import * as keygen from "@/keygen"

import { cn } from "@/lib/utils"
import { getUserLabel } from "@/lib/users"

import { useListLicenses } from "@/queries/licenses"
import { useListProducts } from "@/queries/products"
import { useListEnvironments } from "@/queries/environments"
import { useGetCurrentUser, useListUsers } from "@/queries/users"

import * as Schemas from "@/schemas"
import { Permissions, UserRole } from "@/types/users"
import {
  TokenBearerKind,
  TokenBearerKindLabels,
  TokenFormFieldDescriptions,
  TokenBearerKindDescriptions,
} from "@/types/tokens"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import * as Calendars from "@/components/calendars"
import MultiSelect from "@/components/multi-select"
import { CardSelector, CardOption } from "@/components/card-selector"

const BEARER_KIND_ICONS: Record<TokenBearerKind, ReactNode> = {
  [TokenBearerKind.Admin]: (
    <ShieldCheck className="size-6 text-content-subdued md:size-5" />
  ),
  [TokenBearerKind.User]: (
    <User className="size-6 text-content-subdued md:size-5" />
  ),
  [TokenBearerKind.License]: (
    <KeyRound className="size-6 text-content-subdued md:size-5" />
  ),
  [TokenBearerKind.Product]: (
    <Box className="size-6 text-content-subdued md:size-5" />
  ),
  [TokenBearerKind.Environment]: (
    <Layers className="size-6 text-content-subdued md:size-5" />
  ),
}

const BEARER_KINDS: TokenBearerKind[] = [
  TokenBearerKind.Admin,
  TokenBearerKind.User,
  TokenBearerKind.License,
  TokenBearerKind.Product,
  ...(keygen.config.isCE ? [] : [TokenBearerKind.Environment]),
]

const BEARER_KIND_OPTIONS: CardOption<TokenBearerKind>[] = BEARER_KINDS.map(
  (kind) => ({
    value: kind,
    label: TokenBearerKindLabels[kind],
    icon: BEARER_KIND_ICONS[kind],
    tooltip: TokenBearerKindDescriptions[kind],
  }),
)

const DEFAULT_FIELDS: Schemas.Tokens.FieldNames[] = [
  "bearerKind",
  "name",
  "expiry",
  "maxActivations",
  "maxDeactivations",
  "permissions",
  "bearerId",
]

interface TokensFormFieldsProps {
  include?: Schemas.Tokens.FieldNames[]
  fieldVariant?: FieldVariant
  titleVariant?: boolean
  autoFocus?: Schemas.Tokens.FieldNames
}

export default function TokensFormFields({
  include,
  fieldVariant = "stacking",
  titleVariant,
  autoFocus,
}: TokensFormFieldsProps) {
  const fields = include ?? DEFAULT_FIELDS

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "bearerKind":
            return <BearerKindField key="bearerKind" />
          case "bearerId":
            return <BearerField key="bearerId" fieldVariant={fieldVariant} />
          case "name":
            return (
              <NameField
                key="name"
                autoFocus={autoFocus === "name"}
                titleVariant={titleVariant}
                fieldVariant={fieldVariant}
              />
            )
          case "expiry":
            return <ExpiryField key="expiry" fieldVariant={fieldVariant} />
          case "maxActivations":
            return (
              <MaxActivationsField
                key="maxActivations"
                fieldVariant={fieldVariant}
              />
            )
          case "maxDeactivations":
            return (
              <MaxDeactivationsField
                key="maxDeactivations"
                fieldVariant={fieldVariant}
              />
            )
          case "permissions":
            return !keygen.config.isCE ? (
              <PermissionsField key="permissions" fieldVariant={fieldVariant} />
            ) : null
          default:
            return null
        }
      })}
    </>
  )
}

function BearerKindField() {
  const form = useFormContext<Schemas.Tokens.BaseValues>()

  return (
    <Forms.Field.CardSelector title="Bearer type">
      <FormField
        control={form.control}
        name="bearerKind"
        render={({ field }) => (
          <FormItem>
            <CardSelector
              options={BEARER_KIND_OPTIONS}
              value={field.value}
              onChange={(value) => {
                field.onChange(value)
                form.setValue("bearerId", null)
              }}
              columns={3}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </Forms.Field.CardSelector>
  )
}

function BearerField({ fieldVariant }: { fieldVariant?: FieldVariant }) {
  const form = useFormContext<Schemas.Tokens.BaseValues>()
  const kind = useWatch({ control: form.control, name: "bearerKind" })

  if (kind == null) return null
  if (kind === TokenBearerKind.Admin) {
    return <AdminBearerField fieldVariant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="bearerId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label={TokenBearerKindLabels[kind]}
            variant={fieldVariant}
            tooltip={TokenFormFieldDescriptions.bearer}
          >
            {kind === TokenBearerKind.User && (
              <UserBearerSelect
                value={field.value}
                onChange={field.onChange}
                invalid={!!fieldState.error}
              />
            )}
            {kind === TokenBearerKind.License && (
              <LicenseBearerSelect
                value={field.value}
                onChange={field.onChange}
                invalid={!!fieldState.error}
              />
            )}
            {kind === TokenBearerKind.Product && (
              <ProductBearerSelect
                value={field.value}
                onChange={field.onChange}
                invalid={!!fieldState.error}
              />
            )}
            {kind === TokenBearerKind.Environment && (
              <EnvironmentBearerSelect
                value={field.value}
                onChange={field.onChange}
              />
            )}
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function AdminBearerField({ fieldVariant }: { fieldVariant?: FieldVariant }) {
  const { data: me } = useGetCurrentUser()

  return (
    <FormItem>
      <Forms.Field.Header
        label={TokenBearerKindLabels[TokenBearerKind.Admin]}
        variant={fieldVariant}
        tooltip={TokenFormFieldDescriptions.bearer}
      >
        <Input
          disabled
          readOnly
          value={me ? getUserLabel(me) : ""}
          disabledTooltip="Cannot be changed. Admin tokens can only be created under the current bearer."
        />
      </Forms.Field.Header>
    </FormItem>
  )
}

interface BearerSelectProps {
  value?: string | null
  onChange: (value: string | null) => void
  invalid?: boolean
}

function UserBearerSelect({ value, onChange, invalid }: BearerSelectProps) {
  const { data: users = [] } = useListUsers({
    cursor: "",
    pageSize: 20,
    filters: { roles: [UserRole.User] },
  })

  return (
    <Search.Select
      resource="users"
      options={users}
      value={value}
      onChange={onChange}
      invalid={invalid}
    />
  )
}

function LicenseBearerSelect({ value, onChange, invalid }: BearerSelectProps) {
  const { data: licenses = [] } = useListLicenses({ cursor: "", pageSize: 20 })

  return (
    <Search.Select
      resource="licenses"
      options={licenses}
      value={value}
      onChange={onChange}
      invalid={invalid}
    />
  )
}

function ProductBearerSelect({ value, onChange, invalid }: BearerSelectProps) {
  const { data: products = [] } = useListProducts({ cursor: "", pageSize: 20 })

  return (
    <Search.Select
      resource="products"
      options={products}
      value={value}
      onChange={onChange}
      invalid={invalid}
    />
  )
}

function EnvironmentBearerSelect({ value, onChange }: BearerSelectProps) {
  const { data: environments = [] } = useListEnvironments({
    cursor: "",
    pageSize: 50,
  })

  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an environment" />
      </SelectTrigger>
      <SelectContent>
        {environments.map((environment) => (
          <SelectItem key={environment.id} value={environment.id}>
            {environment.attributes.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function NameField({
  autoFocus,
  titleVariant,
  fieldVariant,
}: {
  autoFocus?: boolean
  titleVariant?: boolean
  fieldVariant?: FieldVariant
}) {
  const form = useFormContext<Schemas.Tokens.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          {titleVariant ? (
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                variant="title"
                placeholder="Enter a token name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus}
                autoComplete="off"
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Name"
              variant={fieldVariant}
              optional
              tooltip={TokenFormFieldDescriptions.name}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. CI server, Production..."
                  autoFocus={autoFocus}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
            </Forms.Field.Header>
          )}
          <FormMessage className={titleVariant ? "ml-2" : undefined} />
        </FormItem>
      )}
    />
  )
}

function ExpiryField({ fieldVariant }: { fieldVariant?: FieldVariant }) {
  const form = useFormContext<Schemas.Tokens.BaseValues>()
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={form.control}
      name="expiry"
      render={({ field }) => {
        const selectedDate = field.value ? parseISO(field.value) : undefined

        return (
          <FormItem>
            <Forms.Field.Header
              label="Expiry date"
              variant={fieldVariant}
              optional
              tooltip={TokenFormFieldDescriptions.expiry}
            >
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-content-normal" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      {field.value && (
                        <span
                          role="button"
                          tabIndex={0}
                          className="ml-auto flex size-6 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            field.onChange(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              e.stopPropagation()
                              field.onChange(null)
                            }
                          }}
                        >
                          <X className="size-3.5" />
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendars.DatePicker
                      selected={selectedDate}
                      onApply={(date) => {
                        field.onChange(date ? date.toISOString() : null)
                        setOpen(false)
                      }}
                      onCancel={() => setOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
            </Forms.Field.Header>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

function MaxActivationsField({
  fieldVariant,
}: {
  fieldVariant?: FieldVariant
}) {
  const form = useFormContext<Schemas.Tokens.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="maxActivations"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max activations"
            variant={fieldVariant}
            optional
            tooltip={TokenFormFieldDescriptions.maxActivations}
          >
            <FormControl>
              <Input
                type="number"
                min={0}
                value={field.value ?? ""}
                placeholder="Unlimited"
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MaxDeactivationsField({
  fieldVariant,
}: {
  fieldVariant?: FieldVariant
}) {
  const form = useFormContext<Schemas.Tokens.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="maxDeactivations"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max deactivations"
            variant={fieldVariant}
            optional
            tooltip={TokenFormFieldDescriptions.maxDeactivations}
          >
            <FormControl>
              <Input
                type="number"
                min={0}
                value={field.value ?? ""}
                placeholder="Unlimited"
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function PermissionsField({ fieldVariant }: { fieldVariant?: FieldVariant }) {
  const form = useFormContext<Schemas.Tokens.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="permissions"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Permissions"
            variant={fieldVariant}
            optional
            tooltip={TokenFormFieldDescriptions.permissions}
          >
            <MultiSelect
              value={field.value}
              onChange={field.onChange}
              options={Permissions.map((permission) => ({
                label: permission,
                value: permission,
              }))}
              includeNone
              includeWildcard
              placeholder="Leave blank to inherit the bearer's permissions"
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
