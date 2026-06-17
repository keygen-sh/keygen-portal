import { z } from "zod"

export const LoginSchema = z.object({
  username: z.string().email("Please enter a valid email."),
})
export type LoginValues = z.infer<typeof LoginSchema>

export const PasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  remember: z.boolean(),
})
export type PasswordValues = z.infer<typeof PasswordSchema>

export const AccountSchema = z.object({
  account: z.string().min(1, "Please enter your account."),
})
export type AccountValues = z.infer<typeof AccountSchema>

export const VerifySchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code."),
})
export type VerifyValues = z.infer<typeof VerifySchema>

export const RegisterSchema = z.object({
  username: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  companyId: z.string().optional(),
})
export type RegisterValues = z.infer<typeof RegisterSchema>

export const RecoverySchema = z.object({
  username: z.string().email("Please enter a valid email."),
})
export type RecoveryValues = z.infer<typeof RecoverySchema>

export const ResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
})
export type ResetValues = z.infer<typeof ResetSchema>

export type FieldNames =
  | "username"
  | "password"
  | "newPassword"
  | "remember"
  | "account"
  | "companyId"
  | "otp"
