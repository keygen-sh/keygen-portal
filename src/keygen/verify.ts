import config from "@/keygen/config"

config.validate()

interface VerifyProps {
  tokenId: string
  token: string
}

/**
 * Checks user token validity with the Keygen API.
 * If the response returns a 401, the token is invalid, otherwise it's still valid.
 *
 * @param {string} props.token - Token to verify
 * @return {Promise<boolean>}
 */
export async function verify({
  tokenId,
  token,
}: VerifyProps): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${config.host}/v1/accounts/${config.id}/tokens/${tokenId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
          "Keygen-Version": config.version,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Token verification failed: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error(
      "Token Error:",
      error instanceof Error ? error.message : "Unknown error occurred",
    )

    return false
  }
}
