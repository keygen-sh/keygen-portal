import type { MockAttributes, MockRefs, MockRow } from "./types"
import { nowIso } from "./time"

export interface MockSnapshot {
  version: string
  profile: string
  seededAt: string
  tables: Record<string, MockRow[]>
}

interface PatchOptions {
  touch?: boolean
}

interface Changes {
  attributes?: MockAttributes
  refs?: MockRefs
}

type Listener = () => void

function compareNewest(a: MockRow, b: MockRow): number {
  if (a.created !== b.created) return a.created < b.created ? 1 : -1
  if (a.id === b.id) return 0
  return a.id < b.id ? 1 : -1
}

export function newestFirst<T extends MockRow>(rows: T[]): T[] {
  return [...rows].sort(compareNewest)
}

export function oldestFirst<T extends MockRow>(rows: T[]): T[] {
  return [...rows].sort(compareNewest).reverse()
}

export class MockTable {
  private rows = new Map<string, MockRow>()

  constructor(
    readonly type: string,
    private readonly onChange: Listener,
  ) {}

  all(): MockRow[] {
    return [...this.rows.values()]
  }

  newest(): MockRow[] {
    return newestFirst(this.all())
  }

  get(id: string): MockRow | undefined {
    return this.rows.get(id)
  }

  has(id: string): boolean {
    return this.rows.has(id)
  }

  find(predicate: (row: MockRow) => boolean): MockRow | undefined {
    for (const row of this.rows.values()) {
      if (predicate(row)) return row
    }
    return undefined
  }

  where(predicate: (row: MockRow) => boolean): MockRow[] {
    return this.all().filter(predicate)
  }

  count(): number {
    return this.rows.size
  }

  insert(row: MockRow): MockRow {
    this.rows.set(row.id, row)
    this.onChange()
    return row
  }

  patch(
    id: string,
    changes: Changes,
    { touch = true }: PatchOptions = {},
  ): MockRow {
    const row = this.rows.get(id)
    if (!row) {
      throw new Error(`Cannot patch missing ${this.type} row '${id}'`)
    }

    if (changes.attributes) {
      row.attributes = { ...row.attributes, ...changes.attributes }
    }
    if (changes.refs) {
      row.refs = { ...row.refs, ...changes.refs }
    }
    if (touch) {
      row.updated = nowIso()
    }

    this.onChange()
    return row
  }

  delete(id: string): boolean {
    const deleted = this.rows.delete(id)
    if (deleted) this.onChange()
    return deleted
  }

  replaceAll(rows: MockRow[]): void {
    this.rows = new Map(rows.map((row) => [row.id, row]))
  }
}

export class MockStore {
  private tables = new Map<string, MockTable>()
  private listeners = new Set<Listener>()
  private silent = false

  table(type: string): MockTable {
    let table = this.tables.get(type)
    if (!table) {
      table = new MockTable(type, () => this.notify())
      this.tables.set(type, table)
    }
    return table
  }

  types(): string[] {
    return [...this.tables.keys()]
  }

  clear(): void {
    this.tables.clear()
    this.notify()
  }

  snapshot(profile: string, seededAt: string, version: string): MockSnapshot {
    const tables: Record<string, MockRow[]> = {}
    for (const [type, table] of this.tables) {
      tables[type] = table.all()
    }
    return { version, profile, seededAt, tables }
  }

  load(snapshot: MockSnapshot): void {
    this.tables.clear()
    for (const [type, rows] of Object.entries(snapshot.tables)) {
      this.table(type).replaceAll(rows)
    }
    this.notify()
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  quietly<T>(work: () => T): T {
    const previous = this.silent
    this.silent = true
    try {
      return work()
    } finally {
      this.silent = previous
      this.notify()
    }
  }

  private notify(): void {
    if (this.silent) return
    for (const listener of this.listeners) listener()
  }
}

export const mockStore = new MockStore()

export function makeMockRow<A extends MockAttributes>(
  type: string,
  id: string,
  attributes: A,
  refs: MockRefs,
  created: string = nowIso(),
  updated: string = created,
): MockRow<A> {
  return { id, type, attributes, refs, created, updated }
}
