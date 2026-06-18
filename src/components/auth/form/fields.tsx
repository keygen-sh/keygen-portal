import { useMemo } from "react"
import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { type FieldVariant } from "@/components/forms/field"

import * as Schemas from "@/schemas"

import * as Forms from "@/components/forms"
import { OtpInput } from "@/components/otp-input"
import { getRecentAccounts } from "@/lib/accounts"
import { SuggestInput } from "@/components/suggest-input"

import { truncator } from "@/lib/truncate"

const truncateId = truncator("clip", { maxLength: 8 })

interface AuthFormFieldsProps {
  include?: Schemas.Auth.FieldNames[]
  exclude?: Schemas.Auth.FieldNames[]
  autoFocus?: Schemas.Auth.FieldNames
  fieldVariant?: FieldVariant
  onOtpComplete?: (value: string) => void
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Auth.FieldNames[] = [
  "username",
  "password",
]

export default function AuthFormFields({
  include,
  exclude = [],
  autoFocus,
  fieldVariant = "stacking",
  onOtpComplete,
}: AuthFormFieldsProps) {
  const fields = include
    ? include
    : INCLUDE_DEFAULT_FIELDS.filter((field) => !exclude.includes(field))

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "username":
            return (
              <UsernameField
                key="username"
                autoFocus={autoFocus === "username"}
                fieldVariant={fieldVariant}
              />
            )
          case "password":
            return (
              <PasswordField
                key="password"
                autoFocus={autoFocus === "password"}
                fieldVariant={fieldVariant}
              />
            )
          case "newPassword":
            return (
              <NewPasswordField
                key="newPassword"
                autoFocus={autoFocus === "newPassword"}
                fieldVariant={fieldVariant}
              />
            )
          case "account":
            return (
              <AccountField
                key="account"
                autoFocus={autoFocus === "account"}
                fieldVariant={fieldVariant}
              />
            )
          case "companyId":
            return (
              <CompanyIdField
                key="companyId"
                autoFocus={autoFocus === "companyId"}
                fieldVariant={fieldVariant}
              />
            )
          case "remember":
            return <RememberField key="remember" />
          case "otp":
            return <OtpField key="otp" onComplete={onOtpComplete} />
          default:
            return null
        }
      })}
    </>
  )
}

interface FieldProps {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
}

function UsernameField({ autoFocus, fieldVariant }: FieldProps) {
  const form = useFormContext<{ username: string }>()

  return (
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header label="Email address" variant={fieldVariant}>
            <FormControl>
              <Input
                {...field}
                type="email"
                autoComplete="username"
                autoFocus={autoFocus}
                placeholder="Enter email..."
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function PasswordField({ autoFocus, fieldVariant }: FieldProps) {
  const form = useFormContext<{ password: string }>()

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header label="Password" variant={fieldVariant}>
            <FormControl>
              <Input
                {...field}
                type="password"
                toggle={true}
                autoComplete="current-password"
                autoFocus={autoFocus}
                placeholder="Enter your password..."
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function NewPasswordField({ autoFocus, fieldVariant }: FieldProps) {
  const form = useFormContext<{ password: string }>()

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header label="New password" variant={fieldVariant}>
            <FormControl>
              <Input
                {...field}
                type="password"
                toggle={true}
                autoComplete="new-password"
                autoFocus={autoFocus}
                placeholder="Enter your password..."
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function AccountField({ autoFocus, fieldVariant }: FieldProps) {
  const form = useFormContext<{ account: string }>()

  const options = useMemo(
    () =>
      getRecentAccounts().map((account, index) => ({
        value: account.id,
        label: account.name,
        description: truncateId(account.id),
        badge: index === 0 ? "Last used" : undefined,
      })),
    [],
  )

  return (
    <FormField
      control={form.control}
      name="account"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header label="Account" variant={fieldVariant}>
            <SuggestInput
              value={field.value}
              onChange={field.onChange}
              options={options}
              emptyMessage="No recent accounts"
              placeholder="Enter account ID or slug..."
              invalid={Boolean(fieldState.error)}
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function CompanyIdField({ autoFocus, fieldVariant }: FieldProps) {
  const form = useFormContext<{ companyId?: string }>()

  return (
    <FormField
      control={form.control}
      name="companyId"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Company ID"
            variant={fieldVariant}
            optional
          >
            <FormControl>
              <Input
                {...field}
                type="text"
                autoFocus={autoFocus}
                placeholder="Enter company ID..."
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function RememberField() {
  const form = useFormContext<{ remember: boolean }>()

  return (
    <FormField
      control={form.control}
      name="remember"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel>Remember me on this device</FormLabel>
        </FormItem>
      )}
    />
  )
}

function OtpField({ onComplete }: { onComplete?: (value: string) => void }) {
  const form = useFormContext<{ otp: string }>()

  return (
    <FormField
      control={form.control}
      name="otp"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormControl>
            <OtpInput
              value={field.value}
              onChange={(value) => {
                field.onChange(value)
                form.clearErrors("otp")
              }}
              onComplete={onComplete}
              error={Boolean(fieldState.error)}
              autoFocus
              size="lg"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
