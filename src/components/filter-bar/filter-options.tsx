export type FilterOption = { value: string; label: string }

export function optionMatchesQuery(option: FilterOption, query: string) {
  const normalizedQuery = query.toLowerCase()

  return (
    option.label.toLowerCase().includes(normalizedQuery) ||
    option.value.toLowerCase().includes(normalizedQuery)
  )
}

export function renderHighlightedText(text: string, query: string) {
  if (!query) return text

  const matchIndex = text.toLowerCase().indexOf(query.toLowerCase())
  if (matchIndex === -1) return text

  const before = text.slice(0, matchIndex)
  const match = text.slice(matchIndex, matchIndex + query.length)
  const after = text.slice(matchIndex + query.length)

  return (
    <>
      {before}
      <mark className="rounded-xs bg-warning/20 px-0 text-warning">
        {match}
      </mark>
      {after}
    </>
  )
}
