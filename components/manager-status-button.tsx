'use client'

import { useActionState } from 'react'

import { setManagerActive } from '@/app/actions/managers'

type Props = {
  managerId: number
  isActive: boolean
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function ManagerStatusButton({
  managerId,
  isActive,
}: Props) {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return setManagerActive(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="manager_id" value={managerId} />
      <input
        type="hidden"
        name="is_active"
        value={isActive ? 'false' : 'true'}
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending
          ? 'Guardando...'
          : isActive
            ? 'Desactivar'
            : 'Activar'}
      </button>

      {state?.error ? (
        <span className="text-sm text-red-400">{state.error}</span>
      ) : null}
    </form>
  )
}
