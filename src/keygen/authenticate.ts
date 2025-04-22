import config from "@keygen/config"

// Make sure environment variables exist
config.validate()

interface AuthProps {
  email: string
  password?: string
  otp?: string
}

export interface AuthResponse {
  data: object
  errors: Array<{
    title: string
    detail: string
    code: string
    source: object
    links: object
  }>
}

/**
 * Authenticates user with Keygen API using email and optional password or one-time password.
 * If both password and otp are omitted, returns either OTP_REQUIRED or PASSWORD_REQUIRED codes stored in { errors }.
 * On success, returns a token object stored in { data }.
 *
 * @param {string} props.email - Email address to authenticate with
 * @param {string} [props.password] - Password to authenticate with
 * @param {string} [props.otp] - One-time password to authenticate with
 * @return {Promise<AuthResponse>} Auth response object containing data, errors, and links
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

    if (!response.ok) {
      const result = (await response.json()) as AuthResponse
      const codes = result.errors?.map((err) => err.code) || []

      if (
        codes.includes("PASSWORD_REQUIRED") ||
        codes.includes("OTP_REQUIRED")
      ) {
        return result
      } else {
        throw new Error(`Request failed with status ${response.status}`)
      }
    }

    const result = (await response.json()) as AuthResponse

    return result
  } catch (error) {
    console.error(
      "Authentication Error:",
      error instanceof Error ? error.message : "Unknown error occurred",
    )

    return {
      data: {},
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
    } as AuthResponse
  }
}
