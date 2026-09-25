import config from "@/keygen/config"

const NAMESPACE = "keygen.demo."
const SHARED_KEYS: ReadonlySet<string> = new Set(["keygen.theme"])

const prototype = Storage.prototype

function native<K extends "getItem" | "setItem" | "removeItem">(
  name: K,
): Storage[K] {
  return Reflect.get(prototype, name) as Storage[K]
}

function namespaced(key: string): string {
  return SHARED_KEYS.has(key) ? key : `${NAMESPACE}${key}`
}

function installDemoStorageNamespace(): void {
  const getItem = native("getItem")
  const setItem = native("setItem")
  const removeItem = native("removeItem")

  prototype.getItem = function (this: Storage, key: string): string | null {
    return getItem.call(this, namespaced(key))
  }

  prototype.setItem = function (
    this: Storage,
    key: string,
    value: string,
  ): void {
    setItem.call(this, namespaced(key), value)
  }

  prototype.removeItem = function (this: Storage, key: string): void {
    removeItem.call(this, namespaced(key))
  }
}

if (config.isDemo) installDemoStorageNamespace()
