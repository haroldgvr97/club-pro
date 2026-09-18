'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function createManager(formData: FormData) {
  const name = formData.get('name')

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'El nombre del manager es obligatorio.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('managers')
      .insert({
        name: name.trim(),
      })

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe un manager con ese nombre.' }
      }

      return { error: 'No se pudo crear el manager.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function updateManager(formData: FormData) {
  const managerId = Number(formData.get('manager_id'))
  const name = formData.get('name')
  const goals = Number(formData.get('goals'))
  const assists = Number(formData.get('assists'))

  if (!Number.isInteger(managerId) || managerId <= 0) {
    return { error: 'Manager inválido.' }
  }

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'El nombre del manager es obligatorio.' }
  }

  if (!Number.isInteger(goals) || goals < 0) {
    return { error: 'Los goles deben ser un número entero igual o mayor que cero.' }
  }

  if (!Number.isInteger(assists) || assists < 0) {
    return { error: 'Las asistencias deben ser un número entero igual o mayor que cero.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('managers')
      .update({
        name: name.trim(),
        goals,
        assists,
      })
      .eq('id', managerId)
      .select('id')
      .maybeSingle()

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe un manager con ese nombre.' }
      }

      return { error: 'No se pudo actualizar el manager.' }
    }

    if (!data) {
      return { error: 'El manager no existe.' }
    }

    revalidatePath('/')
    revalidatePath('/managers')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function setManagerActive(formData: FormData) {
  const managerId = Number(formData.get('manager_id'))
  const isActive = formData.get('is_active')

  if (!Number.isInteger(managerId) || managerId <= 0) {
    return { error: 'Manager inválido.' }
  }

  if (isActive !== 'true' && isActive !== 'false') {
    return { error: 'Estado inválido.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('managers')
      .update({
        is_active: isActive === 'true',
      })
      .eq('id', managerId)
      .select('id')
      .maybeSingle()

    if (error) {
      return { error: 'No se pudo actualizar el estado del manager.' }
    }

    if (!data) {
      return { error: 'El manager no existe.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function deleteManager(formData: FormData) {
  const managerId = Number(formData.get('manager_id'))

  if (!Number.isInteger(managerId) || managerId <= 0) {
    return { error: 'Manager inválido.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('managers')
      .delete()
      .eq('id', managerId)
      .select('id')
      .maybeSingle()

    if (error) {
      if (error.code === '23503') {
        return {
          error:
            'No se puede eliminar este manager porque tiene partidos asociados.',
        }
      }

      return { error: 'No se pudo eliminar el manager.' }
    }

    if (!data) {
      return { error: 'El manager no existe.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
