'use client'

import { useEffect, useState } from 'react'
import { getDashboardGreeting } from '@/lib/dashboard-greeting'

export function DashboardGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('Hola')

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getDashboardGreeting(new Date().getHours()))
    }

    updateGreeting()
    const interval = window.setInterval(updateGreeting, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <h1 className="text-3xl font-bold">
      {greeting}, {name}
    </h1>
  )
}
