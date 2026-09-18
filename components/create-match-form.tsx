'use client'

import { useActionState, useId, useState } from 'react'
import { createMatch } from '@/app/actions/matches'
import { getOpponentHistory, normalizeOpponentName, type OpponentMatch } from '@/lib/matches/opponents'

type Option = { id: number; name: string }
type Props = {
  seasons: Option[]
  managers: Option[]
  opponents: Option[]
  matches: OpponentMatch[]
}
type State = { error?: string; success?: boolean }
const fieldClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white'

export function CreateMatchForm({ seasons, managers, opponents, matches }: Props) {
  const listId = useId()
  const [opponentName, setOpponentName] = useState('')
  const [managerId, setManagerId] = useState('')
  const [seasonId, setSeasonId] = useState(String(seasons[0]?.id ?? ''))
  const [ourGoals, setOurGoals] = useState('')
  const [opponentGoals, setOpponentGoals] = useState('')
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_previousState, formData) => {
      const result = await createMatch(formData)
      if (result.success) {
        setOpponentName('')
        setManagerId('')
        setSeasonId(String(seasons[0]?.id ?? ''))
        setOurGoals('')
        setOpponentGoals('')
      }
      return result
    },
    {}
  )
  const history = getOpponentHistory(matches, opponentName)
  const existing = opponents.find((opponent) =>
    normalizeOpponentName(opponent.name) === normalizeOpponentName(opponentName)
  )

  return (
    <form action={formAction} className="space-y-5">
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-60">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Equipo rival</span>
            <input name="opponent_name" list={listId} value={opponentName}
              onChange={(event) => setOpponentName(event.target.value)}
              required autoComplete="off" placeholder="Escribe o selecciona un equipo"
              className={fieldClass} />
            <datalist id={listId}>
              {opponents.map((opponent) => <option key={opponent.id} value={opponent.name} />)}
            </datalist>
          </label>
          <label className="space-y-2 text-sm">
            <span>Manager que dirige el partido</span>
            <select name="manager_id" required value={managerId}
              onChange={(event) => setManagerId(event.target.value)} className={fieldClass}>
              <option value="">Selecciona un manager</option>
              {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
            </select>
          </label>
        </div>

        {opponentName.trim() && (
          <section aria-label="Historial del equipo rival" className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
            <h3 className="font-semibold">Historial contra {existing?.name ?? opponentName.trim()}</h3>
            {history.length ? (
              <div className="mt-3 max-h-72 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-400"><tr>
                    <th className="p-2">Equipo</th><th className="p-2">Manager</th>
                    <th className="p-2">Resultado (nosotros – rival)</th><th className="p-2">Fecha</th>
                  </tr></thead>
                  <tbody>{history.map((match) => (
                    <tr key={match.id} className="border-t border-zinc-800">
                      <td className="p-2">{match.opponents?.name}</td>
                      <td className="p-2">{match.managers?.name ?? 'Sin manager'}</td>
                      <td className="whitespace-nowrap p-2 font-semibold">{match.our_goals} – {match.opponent_goals}</td>
                      <td className="whitespace-nowrap p-2">{new Date(match.played_at).toLocaleString('es-ES')}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">
                {existing ? 'Todavía no hay partidos registrados contra este equipo.' : 'Equipo nuevo. Se creará al guardar el partido.'}
              </p>
            )}
          </section>
        )}

        <div>
          <h3 className="font-semibold">Resultado final</h3>
          <p className="mb-3 mt-1 text-sm text-zinc-400">Completa el marcador al terminar. La fecha y la hora se guardan automáticamente.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm"><span>Nuestros goles</span>
              <input type="number" name="our_goals" min="0" step="1" required value={ourGoals}
                onChange={(event) => setOurGoals(event.target.value)} className={fieldClass} />
            </label>
            <label className="space-y-2 text-sm"><span>Goles del rival</span>
              <input type="number" name="opponent_goals" min="0" step="1" required value={opponentGoals}
                onChange={(event) => setOpponentGoals(event.target.value)} className={fieldClass} />
            </label>
          </div>
        </div>

        <label className="block space-y-2 text-sm"><span>Temporada</span>
          <select name="season_id" required value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)} className={fieldClass}>
            <option value="">Selecciona una temporada</option>
            {seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
          </select>
        </label>
        {(!seasons.length || !managers.length) && (
          <p className="text-sm text-amber-300">Necesitas una temporada y un manager activo para registrar partidos.</p>
        )}
        <button type="submit" disabled={!seasons.length || !managers.length}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50">
          {pending ? 'Guardando…' : 'Guardar resultado'}
        </button>
      </fieldset>
      <div aria-live="polite">
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-green-400">Partido guardado. Ya aparece en el historial.</p>}
      </div>
    </form>
  )
}
