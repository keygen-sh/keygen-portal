import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
})
export type LoginValues = z.output<typeof LoginSchema>

export const PasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  remember: z.boolean(),
})
export type PasswordValues = z.output<typeof PasswordSchema>

export const AccountSchema = z.object({
  slug: z.string().min(1, "Please enter your account."),
})
export type AccountValues = z.output<typeof AccountSchema>

export const VerifySchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code."),
})
export type VerifyValues = z.output<typeof VerifySchema>

export const RegisterSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})
export type RegisterValues = z.output<typeof RegisterSchema>

export const RecoverySchema = z.object({
  email: z.string().email("Please enter a valid email."),
})
export type RecoveryValues = z.output<typeof RecoverySchema>

export const ResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
})
export type ResetValues = z.output<typeof ResetSchema>

export type FieldNames =
  | "email"
  | "password"
  | "newPassword"
  | "remember"
  | "slug"
  | "otp"
