'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { ACTIVE_TEAM_COOKIE } from '@/lib/teams/active-team'

export async function selectTeam(form: FormData) {
  const id = Number(form.get('team_id'))
  const { supabase } = await getAuthenticatedProfile()
  const { data, error } = await supabase.from('teams').select('id').eq('id', id).maybeSingle()
  if (error || !data) throw new Error('No se pudo abrir el equipo.')
  ;(await cookies()).set(ACTIVE_TEAM_COOKIE, String(id), { path: '/', sameSite: 'lax', httpOnly: true })
  redirect('/')
}

export async function createTeam(form: FormData) {
  const name = String(form.get('name') ?? '').trim()
  if (!name || name.length > 80) return { error: 'Escribe un nombre de 1 a 80 caracteres.' }
  try {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.rpc('create_managed_team', { p_name: name })
    if (error) return { error: error.code === '23505' ? 'Ya existe ese equipo.' : 'No se pudo crear el equipo.' }
    revalidatePath('/teams')
    return { success: 'Equipo creado.' }
  } catch { return { error: 'No autorizado.' } }
}

export async function renameTeam(form: FormData) {
  const id = Number(form.get('team_id'))
  const name = String(form.get('name') ?? '').trim()
  if (!Number.isSafeInteger(id) || id <= 0 || !name || name.length > 80) return { error: 'Nombre o equipo inválido.' }
  try {
    const { supabase } = await requireAdmin()
    const { data, error } = await supabase.from('teams').update({ name }).eq('id', id).select('id').maybeSingle()
    if (error || !data) return { error: 'No se pudo guardar el nombre; comprueba que no esté repetido.' }
    revalidatePath('/', 'layout')
    return { success: 'Nombre actualizado.' }
  } catch { return { error: 'No autorizado.' } }
}

export async function deleteTeam(form: FormData) {
  const id = Number(form.get('team_id'))
  if (!Number.isSafeInteger(id) || id <= 0) return { error: 'Equipo inválido.' }
  try {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.rpc('delete_managed_team', { p_team_id: id })
    if (error) return { error: 'No se pudo eliminar el equipo.' }
    const jar = await cookies()
    if (jar.get(ACTIVE_TEAM_COOKIE)?.value === String(id)) jar.delete(ACTIVE_TEAM_COOKIE)
    revalidatePath('/', 'layout')
    return { success: 'Equipo y datos internos eliminados.' }
  } catch { return { error: 'No autorizado.' } }
}
