'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

type Props = {
  userId: string
  role: string
  initialName: string
  initialAvatarUrl: string | null
}

export function ProfileSettings({ userId, role, initialName, initialAvatarUrl }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? '')
  const [previewUrl, setPreviewUrl] = useState(initialAvatarUrl ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    setFile(nextFile)
    if (nextFile) setPreviewUrl(URL.createObjectURL(nextFile))
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    let nextAvatarUrl = avatarUrl

    try {
      if (file) {
        if (!file.type.startsWith('image/')) throw new Error('Selecciona una imagen válida.')
        if (file.size > 4 * 1024 * 1024) throw new Error('La imagen debe pesar menos de 4 MB.')
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: false })
        if (uploadError) throw uploadError
        nextAvatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      }

      const { error: profileError } = await supabase.rpc('update_profile_settings', {
        p_display_name: name.trim(),
        p_avatar_url: nextAvatarUrl || null,
      })
      if (profileError) throw profileError
      setAvatarUrl(nextAvatarUrl)
      setFile(null)
      setMessage('Perfil actualizado.')
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo actualizar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  async function removePhoto() {
    setSaving(true)
    setError('')
    const { error: profileError } = await supabase.rpc('update_profile_settings', {
      p_display_name: name.trim(),
      p_avatar_url: null,
    })
    if (profileError) setError('No se pudo quitar la foto.')
    else {
      setAvatarUrl('')
      setPreviewUrl('')
      setMessage('Foto eliminada.')
      router.refresh()
    }
    setSaving(false)
  }

  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
    <form onSubmit={save} className="cp-panel p-6 sm:p-8">
      <div className="mb-7 border-b border-zinc-800 pb-5">
        <p className="cp-eyebrow">Tu identidad</p>
        <h2 className="text-xl font-semibold tracking-tight">Datos del perfil</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Este nombre aparece en el saludo, las estadísticas y tu equipo.</p>
      </div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          {previewUrl ? <><span className="sr-only">Foto actual</span><Image src={previewUrl} alt="Foto de perfil" width={112} height={112} unoptimized className="h-28 w-28 rounded-3xl border border-emerald-400/40 object-cover" /></> : <div className="grid h-28 w-28 place-items-center rounded-3xl border border-zinc-700 bg-zinc-900 text-3xl font-semibold text-emerald-300">{name.trim().slice(0, 1).toUpperCase() || '?'}</div>}
          <label className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl border border-zinc-600 bg-zinc-800 text-lg text-white shadow-lg" aria-label="Cambiar foto de perfil">
            +<input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} className="sr-only" />
          </label>
        </div>
        <div className="min-w-0 flex-1">
          <label className="block text-sm text-zinc-300" htmlFor="profile-name">Nombre o alias</label>
          <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} required className="mt-2 w-full px-3 py-2" />
          <p className="mt-2 text-xs text-zinc-500">JPG, PNG o WebP. Máximo 4 MB.</p>
          {previewUrl && <button type="button" onClick={removePhoto} disabled={saving} className="mt-3 text-xs text-zinc-400 underline underline-offset-4 hover:text-white">Quitar foto</button>}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-5">
        <p className="text-xs text-zinc-500">Cuenta: {role === 'admin' ? 'Administrador' : 'Jugador'}</p>
        <button type="submit" disabled={saving} className="cp-button cp-button-primary">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>
      {message && <p className="mt-4 text-sm text-emerald-400" aria-live="polite">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>}
    </form>
    <MfaSettings role={role} />
  </div>
}

function MfaSettings({ role }: { role: string }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    void supabase.auth.mfa.listFactors().then(({ data }) => {
      if (!active) return
      setEnabled(Boolean(data?.totp.some((factor) => factor.status === 'verified')))
      setLoading(false)
    })
    return () => { active = false }
  }, [supabase])

  async function disable() {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.mfa.listFactors()
    const factor = data?.totp.find((item) => item.status === 'verified')
    if (error || !factor) {
      setMessage('No se encontró un autenticador activo.')
      setLoading(false)
      return
    }
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
    if (unenrollError) setMessage('No se pudo desactivar el 2FA. Verifica tu sesión e inténtalo de nuevo.')
    else { setEnabled(false); setMessage('2FA desactivado.') }
    setLoading(false)
  }

  return <section className="cp-panel p-6 sm:p-8">
    <div className="mb-7 border-b border-zinc-800 pb-5">
      <p className="cp-eyebrow">Seguridad</p>
      <h2 className="text-xl font-semibold tracking-tight">Verificación en dos pasos</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">Protege tu cuenta con una aplicación autenticadora.</p>
    </div>
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${enabled ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
      <div><p className="font-medium">{loading ? 'Comprobando…' : enabled ? '2FA activo' : '2FA no configurado'}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{role === 'admin' ? 'Es obligatorio para la cuenta de administrador.' : 'Puedes activarlo o desactivarlo cuando quieras.'}</p></div>
    </div>
    {role === 'admin' ? <button type="button" onClick={() => router.push('/mfa/setup?returnTo=/profile')} className="cp-button cp-button-primary mt-5 w-full">{enabled ? 'Reconfigurar autenticador' : 'Configurar 2FA'}</button> : enabled ? <button type="button" onClick={disable} disabled={loading} className="cp-button mt-5 w-full">Desactivar 2FA</button> : <button type="button" onClick={() => router.push('/mfa/setup?returnTo=/profile')} className="cp-button cp-button-primary mt-5 w-full">Activar 2FA</button>}
    {message && <p className="mt-4 text-sm text-zinc-300" aria-live="polite">{message}</p>}
  </section>
}
