export type ManagerPlayerMatch = {
  manager_id: number
}

export type ManagerPlayerStats = {
  played: number
  goals: number
  assists: number
  goalsPerGame: number
  goalContributions: number
  contributionsPerGame: number
}

export function getManagerPlayerStats(
  matches: ManagerPlayerMatch[],
  managerId: number,
  goals: number,
  assists: number
): ManagerPlayerStats {
  const played = matches.filter((match) => match.manager_id === managerId).length
  const goalContributions = goals + assists

  return {
    played,
    goals,
    assists,
    goalsPerGame: played ? Number((goals / played).toFixed(2)) : 0,
    goalContributions,
    contributionsPerGame: played
      ? Number((goalContributions / played).toFixed(2))
      : 0,
  }
}
