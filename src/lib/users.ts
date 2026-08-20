import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form"

import { AttributeType } from "@/components/attribute/value"

import { User, UserErrorCode, UserRole } from "@/types/users"

import { settleMutations } from "@/queries/utils"

import { toast } from "@/lib/toast"

export function getUserLabel(user: User) {
  return user.attributes.fullName ?? user.attributes.email
}

type InviteUserValues = {
  email: string
  firstName?: string | null
  lastName?: string | null
  role: UserRole
  permissions?: string[] | null
}

interface SettleInviteUsersProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
> {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>
  values?: InviteUserValues[]
  createMutation: {
    mutateAsync: (values: InviteUserValues) => Promise<User>
  }
  resetMutation: {
    mutateAsync: (values: { email: string }) => Promise<void>
  }
}

export async function settleInviteUsers<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  form,
  values,
  createMutation,
  resetMutation,
}: SettleInviteUsersProps<TFieldValues, TContext, TTransformedValues>): Promise<
  User[] | null
> {
  const toInvite = values ?? []

  const [invited, errors] = await settleMutations<User>(
    toInvite.map((invite) =>
      createMutation.mutateAsync(invite).then(async (user) => {
        await resetMutation.mutateAsync({ email: invite.email })

        return user
      }),
    ),
  )

  const nextInvites = errors.map(({ index }) => toInvite[index])

  form.setValue(
    "invites" as Path<TFieldValues>,
    nextInvites as PathValue<TFieldValues, Path<TFieldValues>>,
  )

  if (errors.length > 0) {
    let message = "Field is invalid"
    errors.forEach((error, index) => {
      message =
        error.reason.code === UserErrorCode.EmailTaken
          ? "Email is already taken"
          : "Field is invalid"

      form.setError(`invites.${index}.email` as Path<TFieldValues>, {
        type: "validate",
        message,
      })
    })

    toast({
      message: "Failed to invite teammate(s)",
      description: message,
      variant: "error",
    })

    return null
  }

  return invited
}

const RECENT_STORAGE_KEY = "keygen.user.recent"

export interface RecentUser {
  firstName: string
}

export function getRecentUser(): RecentUser | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    return parsed as RecentUser
  } catch {
    return null
  }
}

export function setRecentUser(user: RecentUser): void {
  window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(user))
}

export const userAttributeTypeSchema: Record<
  keyof Omit<
    User["attributes"],
    "metadata" | "permissions" | "created" | "updated"
  >,
  AttributeType
> = {
  email: "raw",
  firstName: "string",
  lastName: "string",
  fullName: "string",
  status: "enum",
  role: "enum",
}
