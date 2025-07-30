import { useContext } from "react"
import { EnvironmentContext } from "@/contexts/environment-context"

export function useEnvironment() {
  const context = useContext(EnvironmentContext)
  if (!context)
    throw new Error("useEnvironment must be inside an EnvironmentProvider")
  return context
}
