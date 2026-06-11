import { motion } from 'framer-motion'
import type { Dificultad } from '../../data/actividades'
import { labelStyle } from '../../styles/typography'

const TOTAL_DOTS = 6

const CONFIG: Record<Dificultad, { filled: number; color: string; label: string }> = {
  'Fácil':   { filled: 2, color: '#4A7C5F', label: 'Fácil' },
  'Media':   { filled: 4, color: '#40608E', label: 'Media' },
  'Difícil': { filled: 6, color: '#A24A35', label: 'Difícil' },
}

type Props = { dificultad: Dificultad; showLabel?: boolean }

export function DifficultyDots({ dificultad, showLabel = true }: Props) {
  const { filled, color, label } = CONFIG[dificultad]

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: TOTAL_DOTS }).map((_, i) => {
          const isActive = i < filled
          return isActive ? (
            <motion.span
              key={i}
              className="block rounded-full"
              style={{ width: 8, height: 8, backgroundColor: color }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeInOut',
              }}
            />
          ) : (
            <span
              key={i}
              className="block rounded-full bg-stone-200"
              style={{ width: 8, height: 8 }}
            />
          )
        })}
      </div>
      {showLabel && (
        <span
          className="text-[11px] text-stone-500"
          style={labelStyle}
        >
          {label}
        </span>
      )}
    </div>
  )
}
