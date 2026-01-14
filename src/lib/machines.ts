import { AttributeType } from "@/components/attribute/value"

import { Machine, HeartbeatStatus } from "@/types/machines"

export const machineAttributeTypeSchema: Record<
  keyof Omit<Machine["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  fingerprint: "string",
  name: "string",
  ip: "string",
  hostname: "string",
  platform: "string",
  cores: "number",
  memory: "number",
  disk: "number",
  requireHeartbeat: "boolean",
  heartbeatStatus: "string",
  heartbeatDuration: "number",
  lastHeartbeat: "date",
  nextHeartbeat: "date",
  lastCheckOut: "date",
  maxProcesses: "number",
}

export const getHeartbeatStatusVariant = (
  status: HeartbeatStatus,
): "default" | "success" | "disabled" => {
  switch (status) {
    case HeartbeatStatus.Alive:
    case HeartbeatStatus.Resurrected:
      return "success"
    case HeartbeatStatus.Dead:
      return "disabled"
    default:
      return "default"
  }
}
