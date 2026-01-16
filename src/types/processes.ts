import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export enum ProcessMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum ProcessView {
  List = "list",
  Details = "details",
}

export enum ProcessStatus {
  Alive = "ALIVE",
  Dead = "DEAD",
  Resurrected = "RESURRECTED",
}

export type ProcessAttributes = {
  pid: string
  status: ProcessStatus
  lastHeartbeat: string | null
  nextHeartbeat: string | null
  interval: number | null
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export interface ProcessInput {
  pid?: string
  metadata?: Record<string, unknown>
}

export type ProcessRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  product: Relationship<Linkage<"products">>
  license: Relationship<Linkage<"licenses">>
  machine: Relationship<Linkage<"machines">>
}

export type Process = Resource<
  "processes",
  ProcessAttributes,
  ProcessRelationships
>

export type ProcessResponse = APIResponse<Process>
export type ProcessListResponse = APIResponse<Process[]>

export const ProcessAttributeDescriptions: Readonly<
  Record<keyof Omit<ProcessAttributes, "created" | "updated">, string>
> = {
  pid: "The unique pid of the process within the scope of the machine it belongs to.",
  status: "The status of the process.",
  lastHeartbeat:
    "The time at which the process last sent a heartbeat ping (UTC timezone).",
  nextHeartbeat:
    "The time at which the process must send a heartbeat ping by to remain active (UTC timezone).",
  interval:
    "The process must send heartbeat pings within this timeframe to remain alive.",
  metadata:
    "Store arbitrary key/value data on the process, e.g. hostname, IP, args, etc.",
} as const

export const ProcessFormFieldDescriptions: Readonly<
  Record<keyof Omit<ProcessAttributes, "created" | "updated">, string>
> = {
  ...ProcessAttributeDescriptions,
  pid: "This can be an arbitrary string, but must be unique within the scope of the machine it belongs to.",
} as const

export const ProcessStatusDescriptions: Readonly<
  Record<ProcessStatus, string>
> = {
  [ProcessStatus.Alive]:
    "Process is alive and has sent a heartbeat ping within the required window.",
  [ProcessStatus.Dead]:
    "Process has not sent a heartbeat ping within the required window and is considered dead.",
  [ProcessStatus.Resurrected]:
    "Process was previously dead but has sent a new heartbeat ping and is now alive again.",
} as const

export const ProcessStatusLabels: Readonly<Record<ProcessStatus, string>> = {
  [ProcessStatus.Alive]: "Alive",
  [ProcessStatus.Dead]: "Dead",
  [ProcessStatus.Resurrected]: "Resurrected",
} as const

export const ProcessStatusVariants: Readonly<
  Record<
    ProcessStatus,
    "default" | "secondary" | "destructive" | "outline" | "disabled"
  >
> = {
  [ProcessStatus.Alive]: "secondary",
  [ProcessStatus.Dead]: "disabled",
  [ProcessStatus.Resurrected]: "secondary",
} as const

export const MockProcesses: Process[] = []
