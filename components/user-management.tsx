'use client'

import { useState } from 'react'
import { inviteUserV2 } from '@/app/admin/users/invite-action'
import { deleteUser, updateUserName, updateUserPermissions } from '@/app/admin/users/permissions-action'

type Profile = { id: string; email: string; display_name: string | null; role: string; can_manage_matches: boolean; can_edit_other_player_stats: boolean; can_view_other_manager_stats: boolean; can_send_invites: boolean; can_manage_seasons: boolean }
const permissions = [['can_manage_matches', 'Manejo de Partidos'], ['can_edit_other_player_stats', 'Editar Estadísticas de Otros Managers'], ['can_view_other_manager_stats', 'Ver Estadísticas de Otros Managers'], ['can_send_invites', 'Enviar Invitación'], ['can_manage_seasons', 'Agregar Temporadas']] as const

export function UserManagement({ profiles, canManagePermissions, canSendInvites }: { profiles: Profile[]; canManagePermissions: boolean; canSendInvites: boolean }) {
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  async function invite(formData: FormData) { setInviting(true); setInviteMessage(''); const result = await inviteUserV2(formData); setInviteMessage(result.error ?? 'Invitación enviada correctamente.'); setInviting(false) }

  return <>
    {canSendInvites ? <section className="mb-8 max-w-xl rounded-xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="mb-4 text-lg font-semibold">Invitar Usuario</h2><form action={invite} className="flex flex-col gap-4"><input name="email" type="email" placeholder="Correo electrónico" required className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" /><button type="submit" disabled={inviting} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50">{inviting ? 'Enviando...' : 'Enviar Invitación'}</button>{inviteMessage ? <p className="text-sm text-zinc-300">{inviteMessage}</p> : null}</form></section> : null}
    {canManagePermissions ? <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"><div className="border-b border-zinc-800 px-5 py-4"><h2 className="text-lg font-semibold">Usuarios y Permisos</h2><p className="mt-1 text-sm text-zinc-400">Cada cuenta se convierte en Manager/Jugador al completar su invitación.</p></div><div className="divide-y divide-zinc-800">{profiles.map((profile) => <UserPermissionRow key={profile.id} profile={profile} />)}</div></section> : <p className="text-sm text-zinc-400">No tienes permiso para administrar usuarios.</p>}
  </>
}

function UserPermissionRow({ profile }: { profile: Profile }) {
  const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false); const [editingName, setEditingName] = useState(false); const [deleting, setDeleting] = useState(false)
  async function save(formData: FormData) { setSaving(true); setMessage(''); const result = await updateUserPermissions(formData); setMessage(result.error ?? 'Permisos actualizados.'); setSaving(false) }
  async function saveName(formData: FormData) { setSaving(true); setMessage(''); const result = await updateUserName(formData); setMessage(result.error ?? 'Nombre actualizado.'); if (!result.error) setEditingName(false); setSaving(false) }
  async function remove() { if (!window.confirm(`¿Eliminar la cuenta de ${profile.display_name ?? profile.email}? Se conservarán sus resultados históricos.`)) return; setDeleting(true); setMessage(''); const formData = new FormData(); formData.set('user_id', profile.id); const result = await deleteUser(formData); setMessage(result.error ?? 'Usuario eliminado.'); setDeleting(false) }

  return <div className="p-5">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div>{editingName ? <form action={saveName} className="flex flex-wrap gap-2"><input type="hidden" name="user_id" value={profile.id} /><input name="display_name" defaultValue={profile.display_name ?? ''} required maxLength={50} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" /><button type="submit" disabled={saving} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">Guardar Nombre</button><button type="button" onClick={() => setEditingName(false)} className="px-2 text-sm text-zinc-400">Cancelar</button></form> : <><p className="font-semibold">{profile.display_name ?? 'Invitación pendiente'}</p><p className="text-sm text-zinc-400">{profile.email}{profile.role === 'admin' ? ' · Administrador' : ''}</p></>}</div><div className="flex gap-2"><button type="button" onClick={() => setEditingName(true)} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">Editar Nombre</button>{profile.role !== 'admin' ? <button type="button" onClick={remove} disabled={deleting} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50">{deleting ? 'Eliminando...' : 'Eliminar'}</button> : null}</div></div>
    {profile.role === 'admin' ? <p className="text-sm text-zinc-400">El administrador tiene acceso completo.</p> : <form action={save}><input type="hidden" name="user_id" value={profile.id} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{permissions.map(([field, label]) => <label key={field} className="flex items-center gap-2 text-sm text-zinc-200"><input name={field} type="checkbox" defaultChecked={profile[field]} className="size-4" />{label}</label>)}</div><div className="mt-4 flex items-center gap-3"><button type="submit" disabled={saving} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar Permisos'}</button></div></form>}
    {message ? <p className="mt-3 text-sm text-green-400">{message}</p> : null}
  </div>
}
