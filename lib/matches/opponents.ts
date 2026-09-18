export function normalizeOpponentName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function levenshteinDistance(first: string, second: string) {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index)
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    let diagonal = previous[0]
    previous[0] = firstIndex
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const above = previous[secondIndex]
      previous[secondIndex] = Math.min(
        previous[secondIndex] + 1,
        previous[secondIndex - 1] + 1,
        diagonal + Number(first[firstIndex - 1] !== second[secondIndex - 1])
      )
      diagonal = above
    }
  }
  return previous[second.length]
}

export function getSimilarOpponentNames(names: string[], query: string) {
  const normalizedQuery = normalizeOpponentName(query)
  if (normalizedQuery.length < 3) return []

  return names.filter((name) => {
    const normalizedName = normalizeOpponentName(name)
    if (normalizedName === normalizedQuery) return false
    if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) return true
    const longest = Math.max(normalizedName.length, normalizedQuery.length)
    return longest > 0 && levenshteinDistance(normalizedName, normalizedQuery) / longest <= 0.25
  })
}

export type OpponentMatch = {
  id: number
  opponent_id: number
  our_goals: number
  opponent_goals: number
  played_at: string
  opponents: { name: string } | null
  managers: { name: string } | null
}

export function getOpponentHistory(matches: OpponentMatch[], name: string) {
  const normalized = normalizeOpponentName(name)
  if (!normalized) return []
  return matches.filter((match) =>
    match.opponents && normalizeOpponentName(match.opponents.name) === normalized
  ).sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
}
