import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum EventLogView {
  List = "list",
  Details = "details",
}

export type EventLogAttributes = {
  event: string
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export type EventLogRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  request: Relationship<Linkage<"request-logs"> | null>
  whodunnit: Relationship<Linkage | null>
  resource: Relationship<Linkage | null>
}

export type EventLog = Resource<
  "event-logs",
  EventLogAttributes,
  EventLogRelationships
>

export type EventLogResponse = APIResponse<EventLog>
export type EventLogListResponse = APIResponse<EventLog[]>

export const EventLogAttributeDescriptions: Readonly<
  Record<keyof Writable<EventLogAttributes>, string>
> = {
  event: "The event that occurred.",
  metadata: "Additional metadata associated with the event log.",
} as const

export type EventLogResourceFilter =
  | string
  | {
      type: string
      id: string
    }

export type EventLogFilters = {
  events?: string[]
  request?: string
  resource?: EventLogResourceFilter
  whodunnit?: EventLogResourceFilter
  date?: {
    start?: string
    end?: string
  }
}
