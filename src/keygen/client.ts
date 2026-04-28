import config from "@/keygen/config"

import { APIResponse, APIError } from "@/types/api"

export class Client {
  private url = `https://${config.host}/v1`

  private rootToken?: string | null
  private environmentToken?: string | null
  private environment?: string | null
  private user?: string | null

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

  public setUser(id: string | null) {
    this.user = id
  }

  public get currentUser(): string | null | undefined {
    return this.user
  }

  private get activeToken(): string | null | undefined {
    return this.environmentToken ?? this.rootToken
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit & { root?: boolean; signal?: AbortSignal } = {},
  ): Promise<APIResponse<T>> {
    const authToken = options.root ? this.rootToken : this.activeToken
    const defaultHeaders = {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Keygen-Version": config.version,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.root || !this.environment
        ? {}
        : { "Keygen-Environment": this.environment }),
    }

    const headers = {
      ...defaultHeaders,
      ...options.headers,
    }

    const { root, ...fetchOptions } = options
    void root

    const response = await fetch(`${this.url}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
    })

    const data = (await response.json().catch(() => ({}))) as APIResponse<T>

    // Server error, i.e. "PASSWORD_REQUIRED"
    if ("errors" in data) {
      return data
    }

    // Fallback for unexpected errors
    if (!response.ok) {
      return {
        errors: [
          new APIError({
            title: "Request Error",
            detail: `Request failed: ${response.status}`,
            code: "CLIENT_ERROR",
          }),
        ],
      }
    }

    // Success
    return data
  }
}

const client = new Client()

export default client
