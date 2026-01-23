export type Writable<T> = Omit<T, "created" | "updated">

export type OptionalExcept<T, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>

export type Override<T, U> = Omit<T, keyof U> & U
