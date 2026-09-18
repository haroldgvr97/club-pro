export function normalizeOpponentName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
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
