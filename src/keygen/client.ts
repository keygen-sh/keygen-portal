import config from "@/keygen/config"

export class Client {
  private url = `https://${config.host}/v1`

  private rootToken?: string | null
  private environmentToken?: string | null
  private environment?: string | null

  constructor(token?: string | null, environment?: string | null) {
    this.rootToken = token ?? null
    this.environment = environment ?? null
  }

  public setRootToken(token: string | null) {
    this.rootToken = token
  }

  public setEnvironmentToken(token: string | null) {
    this.environmentToken = token
  }

  public setEnvironment(code: string | null) {
    this.environment = code
  }

  private get activeToken(): string | null | undefined {
    return this.environmentToken ?? this.rootToken
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit & { root?: boolean; signal?: AbortSignal } = {},
  ): Promise<T | { errors: unknown[] }> {
    const defaultHeaders = {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Keygen-Version": config.version,
      ...(options.root
        ? { Authorization: `Bearer ${this.rootToken ?? ""}` }
        : this.activeToken
          ? { Authorization: `Bearer ${this.activeToken}` }
          : {}),
      ...(options.root || !this.environment
        ? {}
        : { "Keygen-Environment": this.environment }),
    }

    const headers = {
      ...defaultHeaders,
      ...options.headers,
    }

    const { root, ...fetchOptions } = options

    const response = await fetch(`${this.url}${endpoint}`, {
      ...fetchOptions,
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
