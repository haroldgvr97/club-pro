'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-admin'
import { ACTIVE_TEAM_COOKIE } from '@/lib/teams/active-team'

export async function selectTeam(formData: FormData) {
  const teamId = Number(formData.get('team_id'))
  if (!Number.isInteger(teamId) || teamId <= 0) return
  const { supabase, user } = await requireAdmin()
  const { data } = await supabase.from('team_members').select('team_id').eq('team_id', teamId).eq('profile_id', user.id).maybeSingle()
  if (!data) return
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_TEAM_COOKIE, String(teamId), { path: '/', sameSite: 'lax' })
  redirect('/')
}

export async function createTeam(formData: FormData) {
  const name = typeof formData.get('name') === 'string' ? String(formData.get('name')).trim() : ''
  if (!name) return
  try {
    const { supabase, user } = await requireAdmin()
    const { data: team, error } = await supabase.from('teams').insert({ name, owner_profile_id: user.id }).select('id').single()
    if (error || !team) return
    const { error: memberError } = await supabase.from('team_members').insert({ team_id: team.id, profile_id: user.id })
    if (memberError) return
    revalidatePath('/teams')
  } catch { return }
}

export async function renameTeam(formData: FormData) {
  const teamId = Number(formData.get('team_id')); const name = typeof formData.get('name') === 'string' ? String(formData.get('name')).trim() : ''
  if (!Number.isInteger(teamId) || !name) return
  try { const { supabase } = await requireAdmin(); const { error } = await supabase.from('teams').update({ name }).eq('id', teamId); if (error) return; revalidatePath('/teams') } catch { return }
}

export async function deleteTeam(formData: FormData) {
  const teamId = Number(formData.get('team_id'))
  if (!Number.isInteger(teamId)) return
  try { const { supabase } = await requireAdmin(); const { error } = await supabase.from('teams').delete().eq('id', teamId); if (error) return; revalidatePath('/teams') } catch { return }
}
