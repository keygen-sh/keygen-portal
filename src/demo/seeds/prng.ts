import { uuid } from "@/demo/server/ids"

export interface Rng {
  next(): number
  int(min: number, max: number): number
  float(min: number, max: number): number
  chance(probability: number): boolean
  pick<T>(items: readonly T[]): T
  sample<T>(items: readonly T[], count: number): T[]
  shuffle<T>(items: readonly T[]): T[]
  uuid(at?: number): string
  hex(length: number): string
  weighted<T>(entries: readonly (readonly [T, number])[]): T
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const rng: Rng = {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    float: (min, max) => next() * (max - min) + min,
    chance: (probability) => next() < probability,
    pick: (items) => items[Math.floor(next() * items.length)],
    sample: (items, count) => rng.shuffle(items).slice(0, count),
    shuffle: (items) => {
      const copy = [...items]
      for (let index = copy.length - 1; index > 0; index--) {
        const swap = Math.floor(next() * (index + 1))
        ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
      }
      return copy
    },
    uuid: (at) => uuid(at, next),
    hex: (length) => {
      let output = ""
      while (output.length < length) {
        output += Math.floor(next() * 0x10000)
          .toString(16)
          .padStart(4, "0")
      }
      return output.slice(0, length)
    },
    weighted: (entries) => {
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
      let roll = next() * total
      for (const [value, weight] of entries) {
        roll -= weight
        if (roll <= 0) return value
      }
      return entries[entries.length - 1][0]
    },
  }

  return rng
}
