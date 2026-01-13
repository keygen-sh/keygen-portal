import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"

export enum MachineMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum MachineView {
  List = "list",
  Details = "details",
}

export enum HeartbeatStatus {
  NotStarted = "NOT_STARTED",
  Alive = "ALIVE",
  Dead = "DEAD",
  Resurrected = "RESURRECTED",
}

export type MachineAttributes = {
  fingerprint: string
  name: string | null
  ip: string | null
  hostname: string | null
  platform: string | null
  cores: number | null
  memory: number | null
  disk: number | null
  requireHeartbeat: boolean
  heartbeatStatus: HeartbeatStatus
  heartbeatDuration: number | null
  lastHeartbeat: string | null
  nextHeartbeat: string | null
  lastCheckOut: string | null
  maxProcesses: number | null
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export interface MachineInput {
  fingerprint?: string
  name?: string | null
  ip?: string | null
  hostname?: string | null
  platform?: string | null
  cores?: number | null
  memory?: number | null
  disk?: number | null
  metadata?: Record<string, unknown>
}

export type MachineRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  product: Relationship<Linkage<"products">>
  license: Relationship<Linkage<"licenses">>
  owner: Relationship<Linkage<"users"> | null>
  group: Relationship<Linkage<"groups"> | null>
  components: Relationship<Linkage<"components">[]>
  processes: Relationship<Linkage<"processes">[]>
}

export type Machine = Resource<
  "machines",
  MachineAttributes,
  MachineRelationships
>

export type MachineResponse = APIResponse<Machine>
export type MachineListResponse = APIResponse<Machine[]>

export const MachineAttributeDescriptions: Readonly<
  Record<keyof Omit<MachineAttributes, "created" | "updated">, string>
> = {
  fingerprint: "The unique fingerprint of the machine.",
  name: "The human-readable name of the machine.",
  ip: "The IP of the machine.",
  hostname: "The hostname of the machine.",
  platform: "The platform of the machine.",
  cores: "The number of CPU cores for the machine.",
  memory: "The amount of memory for the machine.",
  disk: "The amount of disk for the machine.",
  requireHeartbeat:
    "Whether or not the machine requires heartbeat pings, i.e. the policy requires heartbeats, or the machine has an active heartbeat monitor.",
  heartbeatStatus: "The status of the machine's heartbeat.",
  heartbeatDuration:
    "The duration in seconds for the machine's heartbeat window. Inherited from the license's policy.",
  lastHeartbeat:
    "The time at which the machine last sent a heartbeat ping (UTC timezone).",
  nextHeartbeat:
    "The time at which the machine must send a heartbeat ping by to remain active (UTC timezone).",
  lastCheckOut:
    "The time at which the machine was last checked-out (UTC timezone).",
  maxProcesses:
    "The maximum number of processes the machine can have associated with it. Inherited from its license.",
  metadata:
    "Store arbitrary key/value data on the machine for book keeping purposes, entitlements, etc.",
} as const

export const MachineFormFieldDescriptions: Readonly<
  Record<keyof Omit<MachineAttributes, "created" | "updated">, string>
> = {
  ...MachineAttributeDescriptions,
  fingerprint:
    "This can be an arbitrary string, but must be unique within the scope of the license it belongs to.",
}

export const MockMachines: Machine[] = []
