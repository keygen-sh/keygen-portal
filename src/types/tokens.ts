import { Writable } from "@/types/utility"
import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export interface TokenAttributes {
  kind: string
  token?: string
  name?: string | null
  expiry?: string | null
  created: string
  updated: string
  permissions?: string[] | null
  maxActivations?: number | null
  activations?: number | null
  maxDeactivations?: number | null
  deactivations?: number | null
}

export type TokenRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment?: Relationship<Linkage<"environments">>
  bearer?: Relationship<
    Linkage<"users"> | Linkage<"products"> | Linkage<"licenses">
  >
}

export type Token = Resource<"tokens", TokenAttributes, TokenRelationships>

export type TokenResponse = APIResponse<Token>
export type TokensListResponse = APIResponse<Token[]>

export type CreateTokenPayload =
  | {
      environment: Exclude<TokenRelationships["environment"], undefined>
      bearer?: never
    }
  | {
      bearer: Exclude<TokenRelationships["bearer"], undefined>
      environment?: never
    }

export interface CreateTokenVariables {
  relationships: CreateTokenPayload
  cacheKey?: (string | number)[]
}

export type UpdateTokenPayload = Partial<Writable<TokenAttributes>>
