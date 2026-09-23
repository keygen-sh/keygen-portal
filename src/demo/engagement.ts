const DWELL_MS = 90_000
const SECTIONS_REQUIRED = 5 // 5 unique sections visited

const listeners = new Set<() => void>()

const startedAt = Date.now()
const sections = new Set<string>()

let mutated = false
let fired = false
let timer: number | null = null

function engaged(): boolean {
  return mutated || sections.size >= SECTIONS_REQUIRED
}

function check(): void {
  if (fired || !engaged()) return

  const waited = Date.now() - startedAt

  if (waited < DWELL_MS) {
    if (timer != null) return

    timer = window.setTimeout(() => {
      timer = null
      check()
    }, DWELL_MS - waited)

    return
  }

  fired = true

  for (const listener of listeners) listener()
}

export function onDemoEngagement(listener: () => void): () => void {
  if (fired) {
    listener()
    return () => undefined
  }

  listeners.add(listener)

  return () => listeners.delete(listener)
}

export function recordDemoSection(path: string): void {
  const section = path.split("/").slice(0, 4).join("/")

  sections.add(section)
  check()
}

export function recordDemoMutation(): void {
  mutated = true
  check()
}
