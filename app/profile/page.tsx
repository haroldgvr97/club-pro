import { AppSidebar } from '@/components/app-sidebar'
import { PageHeading } from '@/components/page-heading'
import { ProfileSettings } from '@/components/profile-settings'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'

export default async function ProfilePage() {
  const { supabase, user, profile } = await getAuthenticatedProfile()
  const { data: account, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()
  if (error || !account) throw new Error('No se pudo cargar tu perfil.')

  return <div className="cp-workspace min-h-screen text-white md:flex">
    <AppSidebar />
    <main className="cp-main"><div className="cp-content">
      <PageHeading eyebrow="Tu cuenta" title="Perfil" description="Administra tu identidad y las opciones de seguridad de tu cuenta." />
      <ProfileSettings userId={user.id} role={profile.role} initialName={account.display_name ?? user.email?.split('@')[0] ?? 'Jugador'} initialAvatarUrl={account.avatar_url} />
    </div></main>
  </div>
}
