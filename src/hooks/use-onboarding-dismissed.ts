import { useCallback, useSyncExternalStore } from "react"

import {
  isOnboardingDismissed,
  subscribeOnboardingDismissed,
} from "@/lib/onboarding"

export function useOnboardingDismissed(accountId: string): boolean {
  const getSnapshot = useCallback(
    () => isOnboardingDismissed(accountId),
    [accountId],
  )

  return useSyncExternalStore(subscribeOnboardingDismissed, getSnapshot)
}
