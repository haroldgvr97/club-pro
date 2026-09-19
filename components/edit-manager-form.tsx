'use client'

import { useActionState } from 'react'

import { updateManager } from '@/app/actions/managers'
import type { ManagerPlayerStats } from '@/lib/stats/manager-player'
import styles from './statistics.module.css'

type Props = {
  managerId: number
  goals: number
  assists: number
  stats: ManagerPlayerStats
  canEdit: boolean
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function EditManagerForm({
  managerId,
  goals,
  assists,
  stats,
  canEdit,
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
      className={styles.playerForm}
    >
      <input type="hidden" name="manager_id" value={managerId} />

      <div className={styles.playerFormHeading}>
        <div><p className="cp-eyebrow">Rendimiento individual</p><h2 className={styles.historyTitle}>Estadísticas como Jugador</h2></div>
        <p className="text-xs text-zinc-400">{canEdit ? 'Edita goles y asistencias directamente aquí.' : 'Tus números, partido a partido.'}</p>
      </div>

      <div className={styles.playerMetrics}>
        <Stat label="Partidos jugados" value={stats.played} />
        {canEdit ? <label className={`${styles.playerMetric} ${styles.editableMetric}`}>
          <span className={styles.metricLabel}>Goles <span className={styles.editHint} aria-hidden="true">↗</span></span>
          <input
            name="goals"
            type="number"
            min="0"
            step="1"
            defaultValue={goals}
            required
            className={`${styles.metricInput} text-emerald-400`}
          />
        </label> : <Stat label="Goles" value={goals} />}
        {canEdit ? <label className={`${styles.playerMetric} ${styles.editableMetric}`}>
          <span className={styles.metricLabel}>Asistencias <span className={styles.editHint} aria-hidden="true">↗</span></span>
          <input
            name="assists"
            type="number"
            min="0"
            step="1"
            defaultValue={assists}
            required
            className={`${styles.metricInput} text-sky-400`}
          />
        </label> : <Stat label="Asistencias" value={assists} />}
        <Stat label="Goles por partido" value={stats.goalsPerGame} />
        <Stat label="Participaciones de gol" value={stats.goalContributions} />
      </div>

      {canEdit ? <div className={styles.saveRow}>
        <span className="text-xs text-zinc-500">Los partidos jugados se calculan automáticamente.</span>
        <button
          type="submit"
          disabled={pending}
          className="cp-button disabled:opacity-50"
        >
          {pending ? 'Guardando...' : 'Guardar'}
        </button>
      </div> : null}

      <div aria-live="polite" className="mt-3">
        {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-green-400">Actualizado.</p> : null}
      </div>
    </form>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.playerMetric}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
    </div>
  )
}
