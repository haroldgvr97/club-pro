'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/require-permission'
import { getSimilarOpponentNames, normalizeOpponentName } from '@/lib/matches/opponents'
import { createAdminClient } from '@/utils/supabase/admin'
import { getActiveTeamId } from '@/lib/teams/active-team'

export async function createMatch(formData: FormData) {
  const playerIds = [...new Set(formData.getAll('player_ids').map(Number))]
  if (playerIds.some(id => !Number.isSafeInteger(id) || id <= 0)) return { error: 'Participantes inválidos.' }
  const seasonId = Number(formData.get('season_id'))
  const managerId = Number(formData.get('manager_id'))
  let opponentId = Number(formData.get('opponent_id'))
  const rawOpponentName = formData.get('opponent_name')
  const opponentName = typeof rawOpponentName === 'string' ? rawOpponentName.trim().replace(/\s+/g, ' ') : ''
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

  if (!opponentName && (!Number.isInteger(opponentId) || opponentId <= 0)) {
    return { error: 'Rival inválido.' }
  }

  if (!String(formData.get('our_goals') ?? '').trim() || !Number.isInteger(ourGoals) || ourGoals < 0) {
    return { error: 'Nuestros goles son inválidos.' }
  }

  if (!String(formData.get('opponent_goals') ?? '').trim() || !Number.isInteger(opponentGoals) || opponentGoals < 0) {
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
    const { supabase: sessionClient } = await requirePermission('can_manage_matches')
    const teamId = await getActiveTeamId()
    const supabase = createAdminClient()

    if (opponentName) {
      const { data: opponents, error: lookupError } = await supabase
        .from('opponents').select('id, name').eq('team_id', teamId)
      if (lookupError) return { error: 'No se pudo buscar el equipo rival.' }

      const existing = opponents?.find((opponent) =>
        normalizeOpponentName(opponent.name) === normalizeOpponentName(opponentName)
      )
      if (existing) {
        opponentId = existing.id
      } else {
        const similar = getSimilarOpponentNames(
          opponents?.map((opponent) => opponent.name) ?? [],
          opponentName
        )
        if (similar.length) {
          return { error: `Ya existe un rival similar: ${similar[0]}. Selecciónalo para evitar duplicados.` }
        }
        const { data: created, error: opponentError } = await supabase
          .from('opponents').insert({ name: opponentName, team_id: teamId }).select('id').single()
        if (opponentError?.code === '23505') {
          // Another request may have just created this team.
          const { data: concurrent, error: concurrentError } = await supabase
            .from('opponents').select('id').eq('team_id', teamId).eq('name', opponentName).single()
          if (concurrentError || !concurrent) return { error: 'No se pudo registrar el equipo rival.' }
          opponentId = concurrent.id
        } else if (opponentError || !created) {
          return { error: 'No se pudo registrar el equipo rival.' }
        } else {
          opponentId = created.id
        }
      }
    }

    const { error } = await sessionClient.rpc('save_match_with_players', {
      p_team_id: teamId,
      p_player_ids: playerIds,
      p_match: {
        season_id: seasonId,
        team_id: teamId,
        manager_id: managerId,
        opponent_id: opponentId,
        our_goals: ourGoals,
        opponent_goals: opponentGoals,
        location: cleanLocation,
        notes: cleanNotes,
        played_at: cleanPlayedAt,
      },
    })

    if (error) {
      if (error.message?.includes('INVALID_PARTICIPANTS')) return { error: 'Todos los participantes deben pertenecer a este equipo.' }
      if (error.code === '23503') {
        return {
          error:
            'La temporada, el manager o el rival seleccionado no existe.',
        }
      }

      return { error: 'No se pudo registrar el partido.' }
    }

    revalidatePath('/')
    revalidatePath('/matches')
    revalidatePath('/seasons')
    revalidatePath('/managers')
    revalidatePath('/opponents')

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
    await requirePermission('can_manage_matches')
    const teamId = await getActiveTeamId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
      .eq('team_id', teamId)
      .select('id')
      .maybeSingle()

    if (error) {
      return { error: 'No se pudo eliminar el partido.' }
    }

    if (!data) {
      return { error: 'El partido no existe.' }
    }

    revalidatePath('/')
    revalidatePath('/matches')
    revalidatePath('/seasons')
    revalidatePath('/managers')
    revalidatePath('/opponents')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function updateMatch(formData: FormData) {
  const playerIds = [...new Set(formData.getAll('player_ids').map(Number))]
  if (playerIds.some(id => !Number.isSafeInteger(id) || id <= 0)) return { error: 'Participantes inválidos.' }
  const matchId = Number(formData.get('match_id'))
  const seasonId = Number(formData.get('season_id'))
  const managerId = Number(formData.get('manager_id'))
  const opponentId = Number(formData.get('opponent_id'))
  const ourGoals = Number(formData.get('our_goals'))
  const opponentGoals = Number(formData.get('opponent_goals'))
  const location = formData.get('location')
  const notes = formData.get('notes')
  const playedAt = formData.get('played_at')

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return { error: 'Partido inválido.' }
  }

  if (!Number.isInteger(seasonId) || seasonId <= 0) {
    return { error: 'Temporada inválida.' }
  }

  if (!Number.isInteger(managerId) || managerId <= 0) {
    return { error: 'Manager inválido.' }
  }

  if (!Number.isInteger(opponentId) || opponentId <= 0) {
    return { error: 'Rival inválido.' }
  }

  if (!String(formData.get('our_goals') ?? '').trim() || !Number.isInteger(ourGoals) || ourGoals < 0) {
    return { error: 'Nuestros goles son inválidos.' }
  }

  if (!String(formData.get('opponent_goals') ?? '').trim() || !Number.isInteger(opponentGoals) || opponentGoals < 0) {
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
    const { supabase } = await requirePermission('can_manage_matches')
    const teamId = await getActiveTeamId()
    const { data, error } = await supabase.rpc('save_match_with_players', {
      p_team_id: teamId,
      p_match_id: matchId,
      p_player_ids: playerIds,
      p_match: {
        season_id: seasonId,
        manager_id: managerId,
        opponent_id: opponentId,
        our_goals: ourGoals,
        opponent_goals: opponentGoals,
        ...(formData.has('location') ? { location: cleanLocation } : {}),
        notes: cleanNotes,
        played_at: cleanPlayedAt,
      },
    })

    if (error) {
      if (error.code === '23503') {
        return {
          error:
            'La temporada, el manager o el rival seleccionado no existe.',
        }
      }

      if (error.message?.includes('INVALID_PARTICIPANTS')) return { error: 'Todos los participantes deben pertenecer a este equipo.' }
      return { error: 'No se pudo actualizar el partido.' }
    }

    if (!data) {
      return { error: 'El partido no existe.' }
    }

    revalidatePath('/')
    revalidatePath('/matches')
    revalidatePath('/opponents')
    revalidatePath('/seasons')
    revalidatePath('/managers')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
