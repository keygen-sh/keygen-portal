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

import * as Schemas from "@/schemas"

import { truncator } from "@/lib/truncate"
import { getRecentAccounts } from "@/lib/accounts"

import { AuthFormFieldDescriptions } from "@/types/auth"

import * as Forms from "@/components/forms"
import OtpInput from "@/components/otp-input"
import SuggestInput from "@/components/suggest-input"

const truncateId = truncator("clip", { maxLength: 8 })

interface AuthFormFieldsProps {
  include: Schemas.Auth.FieldNames[]
  autoFocus?: Schemas.Auth.FieldNames
  onOtpComplete?: (value: string) => void
}

export default function AuthFormFields({
  include,
  autoFocus,
  onOtpComplete,
}: AuthFormFieldsProps) {
  return (
    <>
      {include.map((field) => {
        switch (field) {
          case "email":
            return <EmailField key="email" autoFocus={autoFocus === "email"} />
          case "password":
            return (
              <PasswordField
                key="password"
                autoFocus={autoFocus === "password"}
              />
            )
          case "newPassword":
            return (
              <PasswordField
                key="newPassword"
                mode="new"
                autoFocus={autoFocus === "newPassword"}
              />
            )
          case "slug":
            return <SlugField key="slug" autoFocus={autoFocus === "slug"} />
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
}

function EmailField({ autoFocus }: FieldProps) {
  const form = useFormContext<{ email: string }>()

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Email address"
            tooltip={AuthFormFieldDescriptions.email}
            variant="stacking"
          >
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

function PasswordField({
  autoFocus,
  mode = "current",
}: FieldProps & { mode?: "current" | "new" }) {
  const form = useFormContext<{ password: string }>()
  const isNew = mode === "new"

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label={isNew ? "New password" : "Password"}
            tooltip={
              isNew
                ? AuthFormFieldDescriptions.newPassword
                : AuthFormFieldDescriptions.password
            }
            variant="stacking"
          >
            <FormControl>
              <Input
                {...field}
                type="password"
                toggle={true}
                autoComplete={isNew ? "new-password" : "current-password"}
                autoFocus={autoFocus}
                placeholder="Enter password..."
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SlugField({ autoFocus }: FieldProps) {
  const form = useFormContext<{ slug: string }>()

  const options = useMemo(
    () =>
      getRecentAccounts().map((account, index) => ({
        value: account.slug,
        label: account.name,
        description: truncateId(account.id),
        badge: index === 0 ? "Last used" : undefined,
      })),
    [],
  )

  return (
    <FormField
      control={form.control}
      name="slug"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Account"
            tooltip={AuthFormFieldDescriptions.slug}
            variant="stacking"
          >
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
