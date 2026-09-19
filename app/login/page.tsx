import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={login} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Clubes Pro</h1>

        {error === 'invalid_credentials' && (
          <p role="alert">No se pudo iniciar sesión. Revisa tu correo y contraseña e inténtalo de nuevo.</p>
        )}

        <input
          name="email"
          type="email"
          aria-label="Correo electrónico"
          autoComplete="email"
          placeholder="Correo electrónico"
          required
          className="rounded border p-3"
        />

        <input
          name="password"
          type="password"
          aria-label="Contraseña"
          autoComplete="current-password"
          placeholder="Contraseña"
          required
          className="rounded border p-3"
        />

        <button
          type="submit"
          className="rounded bg-black p-3 text-white"
        >
          Iniciar sesión
        </button>
      </form>
    </main>
  )
}
