'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function createMatch(formData: FormData) {
  const seasonId = Number(formData.get('season_id'))
  const managerId = Number(formData.get('manager_id'))
  const opponentId = Number(formData.get('opponent_id'))
  const ourGoals = Number(formData.get('our_goals'))
  const opponentGoals = Number(formData.get('opponent_goals'))

  const location = formData.get('location')
  const notes = formData.get('notes')
  const playedAt = formData.get('played_at')

  if (!Number.isInteger(seasonId) || seasonId <= 0) {
    return { error: 'Temporada inválida.' }
  }

  if (!Number.isInteger(managerId) || managerId <= 0) {
    return { error: 'Manager inválido.' }
  }

  if (!Number.isInteger(opponentId) || opponentId <= 0) {
    return { error: 'Rival inválido.' }
  }

  if (!Number.isInteger(ourGoals) || ourGoals < 0) {
    return { error: 'Nuestros goles son inválidos.' }
  }

  if (!Number.isInteger(opponentGoals) || opponentGoals < 0) {
    return { error: 'Los goles del rival son inválidos.' }
  }

  if (
    location !== null &&
    location !== '' &&
    location !== 'home' &&
    location !== 'away'
  ) {
    return { error: 'Ubicación inválida.' }
  }

  const cleanLocation =
    location === 'home' || location === 'away' ? location : null

  const cleanNotes =
    typeof notes === 'string' && notes.trim() ? notes.trim() : null

let cleanPlayedAt = new Date().toISOString()

if (typeof playedAt === 'string' && playedAt) {
  const parsedPlayedAt = new Date(playedAt)

  if (Number.isNaN(parsedPlayedAt.getTime())) {
    return { error: 'Fecha del partido inválida.' }
  }

  cleanPlayedAt = parsedPlayedAt.toISOString()
}

  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('matches')
      .insert({
        season_id: seasonId,
        manager_id: managerId,
        opponent_id: opponentId,
        our_goals: ourGoals,
        opponent_goals: opponentGoals,
        location: cleanLocation,
        notes: cleanNotes,
        played_at: cleanPlayedAt,
      })

    if (error) {
      if (error.code === '23503') {
        return {
          error:
            'La temporada, el manager o el rival seleccionado no existe.',
        }
      }

      return { error: 'No se pudo registrar el partido.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function deleteMatch(formData: FormData) {
  const matchId = Number(formData.get('match_id'))

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return { error: 'Partido inválido.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
      .select('id')
      .maybeSingle()

    if (error) {
      return { error: 'No se pudo eliminar el partido.' }
    }

    if (!data) {
      return { error: 'El partido no existe.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
