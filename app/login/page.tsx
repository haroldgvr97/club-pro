import { login } from './actions'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <form action={login} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Club Pro</h1>

        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          required
          className="rounded border p-3"
        />

        <input
          name="password"
          type="password"
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
