'use client'

import { useState } from 'react'
import styles from '@/app/login/login.module.css'

const phrase = 'Preguntale a Lebron James si es un juego.'

export function LoginScene() {
  const [paused, setPaused] = useState(false)

  return (
    <div className={styles.scene} data-paused={paused}>
      <svg className={styles.pitch} viewBox="0 0 680 440" fill="none" aria-hidden="true">
        <defs>
          <pattern id="pitch-grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M34 0H0V34" stroke="currentColor" strokeOpacity=".12" />
          </pattern>
        </defs>
        <path fill="url(#pitch-grid)" d="M0 0h680v440H0z" />
        <g stroke="currentColor" strokeWidth="1.2" opacity=".4">
          <rect x="50" y="45" width="580" height="350" rx="2" />
          <path d="M340 45v350M50 125h95v190H50m0-145h40v100H50m580-145h-95v190h95m0-145h-40v100h40" />
          <circle cx="340" cy="220" r="58" />
          <circle cx="340" cy="220" r="3" fill="currentColor" />
          <path d="M145 175a58 58 0 0 1 0 90m390-90a58 58 0 0 0 0 90" />
        </g>
        <path d="m158 292 119-133 119 98 112-120" stroke="#34d399" strokeWidth="1.5" strokeDasharray="5 7" opacity=".55" />
        {[[158, 292], [277, 159], [396, 257], [508, 137]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="14" fill="#101a16" stroke="#34d399" strokeOpacity=".5" />
            <circle cx={x} cy={y} r="4" fill="#34d399" />
          </g>
        ))}
      </svg>
      <p className="sr-only">{phrase}</p>
      <div className={styles.quotes} aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <p className={`${styles.quote} ${styles[`quote${index}`]}`} key={index}>
            <span className={styles.quoteMark}>“</span>
            {phrase}
          </p>
        ))}
      </div>
      <button className={styles.motionToggle} type="button" aria-pressed={paused}
        aria-label={paused ? 'Reanudar animación de la frase' : 'Pausar animación de la frase'}
        onClick={() => setPaused(!paused)}>
        <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
        {paused ? 'Reanudar' : 'Pausar'}
      </button>
      <span className={styles.sceneCaption} aria-hidden="true">EL PARTIDO EMPIEZA AQUÍ</span>
    </div>
  )
}
