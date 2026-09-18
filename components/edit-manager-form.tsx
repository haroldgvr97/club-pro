'use client'

import { useActionState } from 'react'

import { updateManager } from '@/app/actions/managers'
import type { ManagerPlayerStats } from '@/lib/stats/manager-player'

type Props = {
  managerId: number
  currentName: string
  goals: number
  assists: number
  stats: ManagerPlayerStats
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function EditManagerForm({
  managerId,
  currentName,
  goals,
  assists,
  stats,
}: Props) {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return updateManager(formData)
    },
    initialState
  )

  return (
    <form
      action={formAction}
      className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
    >
      <input type="hidden" name="manager_id" value={managerId} />

      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-medium">Estadísticas como jugador</h2>
        <p className="text-xs text-zinc-500">Edita goles y asistencias directamente aquí.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Partidos jugados" value={stats.played} />
        <label className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-400">
          <span className="block">Goles</span>
          <input
            name="goals"
            type="number"
            min="0"
            step="1"
            defaultValue={goals}
            required
            className="mt-1 w-full bg-transparent text-xl font-semibold text-emerald-400 outline-none"
          />
        </label>
        <label className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-400">
          <span className="block">Asistencias</span>
          <input
            name="assists"
            type="number"
            min="0"
            step="1"
            defaultValue={assists}
            required
            className="mt-1 w-full bg-transparent text-xl font-semibold text-sky-400 outline-none"
          />
        </label>
        <Stat label="Goles por partido" value={stats.goalsPerGame} />
        <Stat label="Participaciones de gol" value={stats.goalContributions} />
        <Stat label="Participaciones por partido" value={stats.contributionsPerGame} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="text-sm text-zinc-300">
          <span className="mb-1 block">Nombre del manager</span>
          <input
            name="name"
            type="text"
            defaultValue={currentName}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="self-end rounded-lg border border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div aria-live="polite" className="mt-3">
        {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-green-400">Actualizado.</p> : null}
      </div>
    </form>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}
