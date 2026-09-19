import { login } from './actions'
import { LoginScene } from '@/components/login-scene'
import { LoginSubmit } from '@/components/login-submit'
import styles from './login.module.css'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className={styles.page}>
      <section className={styles.story} aria-label="Clubes Pro">
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">CP<span /></span>
          <span>CLUBES PRO<span className={styles.brandCaption}>EL FÚTBOL SE VIVE EN EQUIPO.</span></span>
        </div>
        <div className={styles.headline}>
          <p className={styles.eyebrow}><span />MENTALIDAD DE EQUIPO.</p>
          <h1>JUEGA.<br />COMPITE.<br /><span>TRASCIENDE.</span></h1>
          <p className={styles.intro}>Tu equipo. Tus números. Tu legado.</p>
        </div>
        <LoginScene />
        <div className={styles.storyFooter}><span>UN EQUIPO. UNA MISMA AMBICIÓN.</span><span aria-hidden="true">↗</span></div>
      </section>

      <section className={styles.access} aria-labelledby="login-heading">
        <span className={styles.accessCorner} aria-hidden="true">CP / ACCESO</span>
        <div className={styles.formWrap}>
          <div className={styles.formEmblem} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></svg>
          </div>
          <p className={styles.eyebrow}>BIENVENIDO A TU CLUB</p>
          <h2 id="login-heading">Vuelve al juego.</h2>
          <p className={styles.formIntro}>Cada partido cuenta. El siguiente empieza contigo.</p>
          <form action={login} className={styles.form}>
            {error === 'invalid_credentials' && (
              <p role="alert" className={styles.error}>No se pudo iniciar sesión. Revisa tu correo y contraseña e inténtalo de nuevo.</p>
            )}
            <label htmlFor="login-email">Correo electrónico</label>
            <input id="login-email" name="email" type="email" autoComplete="email"
              autoCapitalize="none" spellCheck={false} placeholder="tu@correo.com" required />
            <label htmlFor="login-password">Contraseña</label>
            <input id="login-password" name="password" type="password" autoComplete="current-password"
              placeholder="Tu contraseña" required />
            <LoginSubmit />
          </form>
          <p className={styles.inviteNote}>Tu lugar en el equipo empieza con una invitación.</p>
        </div>
        <div className={styles.accessFooter}>
          <span><span className={styles.secureDot} />ACCESO CON VERIFICACIÓN EN DOS PASOS</span>
          <span>CLUBES PRO</span>
        </div>
      </section>
    </main>
  )
}
