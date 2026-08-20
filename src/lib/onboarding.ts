const dismissed = new Set<string>()

const listeners = new Set<() => void>()

export function isOnboardingDismissed(accountId: string): boolean {
  return dismissed.has(accountId)
}

export function dismissOnboarding(accountId: string): void {
  dismissed.add(accountId)

  for (const listener of listeners) {
    listener()
  }
}

export function subscribeOnboardingDismissed(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
