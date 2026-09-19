'use client'

import { useFormStatus } from 'react-dom'
import styles from '@/app/login/login.module.css'

export function LoginSubmit() {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending} className={styles.submit}>
    <span>{pending ? 'Entrando…' : 'Iniciar sesión'}</span>
    <span aria-hidden="true">↗</span>
  </button>
}
