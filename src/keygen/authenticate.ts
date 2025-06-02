import config from "@/keygen/config"
import { isAuthError } from "@/keygen/errors"
import { AuthResponse } from "@/types/auth"

// Make sure environment variables exist
config.validate()

interface AuthProps {
  email: string
  password?: string
  otp?: string
}

/**
 * Authenticates user with Keygen API using email and optional password or one-time password.
 * If both password and otp are omitted, returns either OTP_REQUIRED or PASSWORD_REQUIRED codes stored in { errors }.
 * On success, returns a token object stored in { data }.
 */
export async function authenticate({
  email,
  password,
  otp,
}: AuthProps): Promise<AuthResponse> {
  try {
    const credentials = btoa(
      unescape(encodeURIComponent(`${email || ""}:${password || ""}`)),
    )

    const body = otp != null ? JSON.stringify({ meta: { otp } }) : undefined

    const response = await fetch(`https://${config.host}/v1/tokens`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        "Keygen-Version": config.version,
      },
      body,
    })

    const result = (await response.json()) as AuthResponse

    if (!response.ok) {
      const codes = result.errors?.map((err) => err.code) || []

      if (codes.some(isAuthError)) {
        return result
      } else {
        throw new Error(`Request failed with status ${response.status}`)
      }
    }

    return result
  } catch (error) {
    console.error(
      "Authentication Error:",
      error instanceof Error ? error.message : "Unknown error occurred",
    )

    return {
      errors: [
        {
          title: "Authentication Error",
          detail:
            error instanceof Error ? error.message : "Unknown error occurred",
          code: "CLIENT_ERROR",
          source: {},
          links: {},
        },
      ],
    }
  }
}
