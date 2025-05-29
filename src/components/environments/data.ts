import { Environment } from "@/types/environments"

// Dummy
const data: Environment[] = [
  {
    id: "env_nil",
    name: "Global",
    code: "nil",
    isolationStrategy: "SHARED",
    created: "2025-05-20T12:00:00Z",
    updated: "2025-05-20T12:00:00Z",
  },
  {
    id: "env_prod",
    name: "Production",
    code: "prod",
    isolationStrategy: "ISOLATED",
    created: "2025-05-22T15:30:00Z",
    updated: "2025-05-22T15:30:00Z",
  },
  {
    id: "env_dev",
    name: "Development",
    code: "dev",
    isolationStrategy: "ISOLATED",
    created: "2025-05-23T08:45:00Z",
    updated: "2025-05-23T08:45:00Z",
  },
  {
    id: "env_staging",
    name: "Staging",
    code: "staging",
    isolationStrategy: "ISOLATED",
    created: "2025-05-24T11:15:00Z",
    updated: "2025-05-24T11:15:00Z",
  },
  {
    id: "env_sandbox",
    name: "Sandbox",
    code: "sandbox",
    isolationStrategy: "ISOLATED",
    created: "2025-05-24T11:15:00Z",
    updated: "2025-05-24T11:15:00Z",
  },
]

export { data }
