const prototype = Node.prototype

function native<K extends "removeChild" | "insertBefore">(name: K): Node[K] {
  return Reflect.get(prototype, name) as Node[K]
}

function isChildOf(parent: Node, node: Node): boolean {
  return node.parentNode === parent
}

// prevents crashes when Google Translate rewrites React's text nodes
function installForeignDomMutationGuard(): void {
  const removeChild = native("removeChild")
  const insertBefore = native("insertBefore")

  prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (!isChildOf(this, child)) return child
    return removeChild.call(this, child) as T
  }

  prototype.insertBefore = function <T extends Node>(
    this: Node,
    node: T,
    child: Node | null,
  ): T {
    const reference = child && isChildOf(this, child) ? child : null
    return insertBefore.call(this, node, reference) as T
  }
}

installForeignDomMutationGuard()
