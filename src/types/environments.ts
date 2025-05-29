interface Environment {
  id: string
  name: string
  code: string
  isolationStrategy: "ISOLATED" | "SHARED"
  admin?: string
  created: string
  updated?: string
}

export type { Environment }
