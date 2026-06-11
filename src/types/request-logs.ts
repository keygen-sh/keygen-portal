import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export enum RequestLogView {
  List = "list",
  Details = "details",
}

export type RequestLogAttributes = {
  url: string
  method: string
  status: string
  ip: string | null
  userAgent: string | null
  requestHeaders?: Record<string, unknown> | null
  requestBody?: string | null
  responseSignature?: string | null
  responseHeaders?: Record<string, unknown> | null
  responseBody?: string | null
  created: string
  updated: string
}

export type RequestLogRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  requestor: Relationship<Linkage | null>
  resource: Relationship<Linkage | null>
}

export type RequestLog = Resource<
  "request-logs",
  RequestLogAttributes,
  RequestLogRelationships
>

export type RequestLogResponse = APIResponse<RequestLog>
export type RequestLogListResponse = APIResponse<RequestLog[]>

export type RequestLogResourceFilter =
  | string
  | {
      type: string
      id: string
    }

export type RequestLogFilters = {
  method?: string
  status?: string
  ip?: string
  url?: string
  requestor?: RequestLogResourceFilter
  resource?: RequestLogResourceFilter
  date?: {
    start?: string
    end?: string
  }
}
