import { useRef } from "react"

interface ActiveDrag {
  pointerId: number
  startY: number
  from: number
  target: number
  moved: boolean
  rows: HTMLElement[]
  stride: number
}

function moveItem<T>(items: ReadonlyArray<T>, from: number, to: number): T[] {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function reorderSubset<T>(
  all: ReadonlyArray<T>,
  subset: ReadonlyArray<T>,
  from: number,
  to: number,
): T[] {
  const queue = moveItem(subset, from, to)
  const visible = new Set(subset)
  return all.map((item) => (visible.has(item) ? queue.shift()! : item))
}

export function useListReorder(onReorder: (from: number, to: number) => void) {
  const dragRef = useRef<ActiveDrag | null>(null)

  const settle = (commit: boolean) => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    for (const row of drag.rows) {
      row.style.transform = ""
      row.style.transition = ""
      row.style.zIndex = ""
      row.style.position = ""
    }
    if (commit && drag.moved && drag.target !== drag.from) {
      onReorder(drag.from, drag.target)
    }
  }

  const handleProps = {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || !event.isPrimary) return
      const item = event.currentTarget.closest<HTMLElement>(
        "[data-reorder-item]",
      )
      const list = item?.parentElement
      if (!item || !list) return
      const rows = Array.from(
        list.querySelectorAll<HTMLElement>(":scope > [data-reorder-item]"),
      )
      if (rows.length < 2) return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const from = rows.indexOf(item)
      dragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        from,
        target: from,
        moved: false,
        rows,
        stride:
          rows[1].getBoundingClientRect().top -
          rows[0].getBoundingClientRect().top,
      }
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      const offset = event.clientY - drag.startY
      if (!drag.moved && Math.abs(offset) < 3) return
      drag.moved = true
      drag.target = Math.min(
        drag.rows.length - 1,
        Math.max(0, drag.from + Math.round(offset / drag.stride)),
      )
      const dragged = drag.rows[drag.from]
      dragged.style.transform = `translateY(${offset}px)`
      dragged.style.zIndex = "10"
      dragged.style.position = "relative"
      drag.rows.forEach((row, i) => {
        if (i === drag.from) return
        const shift =
          i > drag.from && i <= drag.target
            ? -drag.stride
            : i < drag.from && i >= drag.target
              ? drag.stride
              : 0
        row.style.transition = "transform 150ms"
        row.style.transform = shift ? `translateY(${shift}px)` : ""
      })
    },
    onPointerUp: () => settle(true),
    onPointerCancel: () => settle(false),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation()
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") event.stopPropagation()
    },
  }

  const isDragging = () => dragRef.current?.moved ?? false

  return { handleProps, isDragging }
}
