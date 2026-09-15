import { logout } from './logout-action'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Club Pro</h1>

      <p>Sesión iniciada correctamente.</p>

      <form action={logout}>
        <button
          type="submit"
          className="rounded bg-black px-6 py-3 text-white"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  )
}
