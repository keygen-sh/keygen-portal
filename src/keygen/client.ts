import config from "@/keygen/config"

export class Client {
  private url = `https://${config.host}/v1`
  private token?: string | null

  constructor(token?: string) {
    this.token = token
  }

  public setToken(token: string | null) {
    this.token = token ?? undefined
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit & { signal?: AbortSignal } = {},
  ): Promise<T | { errors: unknown[] }> {
    const defaultHeaders = {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Keygen-Version": config.version,
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    }

    const headers = {
      ...defaultHeaders,
      ...options.headers,
    }

    const response = await fetch(`${this.url}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json().catch(() => ({}))

    // Server error, i.e. "PASSWORD_REQUIRED"
    if (data?.errors?.length) {
      return data
    }

    // Fallback for unexpected errors
    if (!response.ok) {
      return {
        errors: [
          {
            title: "Request Error",
            detail:
              data?.errors?.[0]?.detail || `Request failed: ${response.status}`,
            code: "CLIENT_ERROR",
          },
        ],
      }
    }

    // Success
    return data
  }
}

const client = new Client()

export default client
