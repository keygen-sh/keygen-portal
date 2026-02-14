import { Children, isValidElement } from "react"

// Extracts data from React children by inspecting their props
export function extractFromChildren<T>(
  children: React.ReactNode,
  extract: (props: Record<string, unknown>) => T | null,
  options?: { recursive?: boolean },
): T[] {
  const results: T[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return

    const props = child.props as Record<string, unknown>
    const extracted = extract(props)

    if (extracted !== null) {
      results.push(extracted)
    }

    if (options?.recursive && props.children) {
      results.push(
        ...extractFromChildren(
          props.children as React.ReactNode,
          extract,
          options,
        ),
      )
    }
  })

  return results
}
