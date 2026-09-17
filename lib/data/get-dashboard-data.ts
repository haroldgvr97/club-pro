import { createClient } from '@/utils/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()

  const [
    seasonsResult,
    managersResult,
    opponentsResult,
    matchesResult,
  ] = await Promise.all([
    supabase
      .from('seasons')
      .select('*')
      .order('is_active', { ascending: false })
      .order('start_date', { ascending: false }),

    supabase
      .from('managers')
      .select('*')
      .order('is_active', { ascending: false })
      .order('name'),

    supabase
      .from('opponents')
      .select('*')
      .order('name'),

    supabase
      .from('matches')
      .select(`
        *,
        seasons (
          id,
          name
        ),
        managers (
          id,
          name
        ),
        opponents (
          id,
          name
        )
      `)
      .order('played_at', { ascending: false }),
  ])

  if (seasonsResult.error) {
    throw new Error('No se pudieron cargar las temporadas.')
  }

  if (managersResult.error) {
    throw new Error('No se pudieron cargar los managers.')
  }

  if (opponentsResult.error) {
    throw new Error('No se pudieron cargar los rivales.')
  }

  if (matchesResult.error) {
    throw new Error('No se pudieron cargar los partidos.')
  }

  return {
    seasons: seasonsResult.data ?? [],
    managers: managersResult.data ?? [],
    opponents: opponentsResult.data ?? [],
    matches: matchesResult.data ?? [],
  }
}
