import { motion } from 'framer-motion'
import type { Transition } from 'framer-motion'
import rawMonumental from '../../assets/skyline monumental-01.svg?raw'
import rawPopular from '../../assets/skyline popular canarias-01.svg?raw'
import { SkylineCanvas } from './SkylineCanvas'

const titleTransition = (delay = 0): Transition => ({
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
  delay,
})

export function Hero() {
  return (
    <section
      className="h-[80vh] flex justify-center px-8 sm:px-16"
      style={{ background: 'linear-gradient(to bottom, #c36414, #d6a103)' }}
    >
      <div className="my-auto flex flex-col items-center w-fit gap-6">
        <SkylineCanvas svg={rawMonumental} prefix="sm" className="w-full" />
        <h1
          className="flex items-center gap-3 text-3xl sm:text-4xl lg:text-5xl font-thin text-white uppercase tracking-widest"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}
        >
          <motion.span
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: [null, 0], opacity: [null, 1] }}
            transition={titleTransition(0.6)}
          >
            Conjuntos Históricos
          </motion.span>
          <motion.span
            initial={{ x: 280, opacity: 0 }}
            animate={{ x: [null, 0], opacity: [null, 1] }}
            transition={titleTransition(0.75)}
          >
            de Canarias
          </motion.span>
        </h1>
        <SkylineCanvas svg={rawPopular} prefix="sp" className="w-full" />
      </div>
    </section>
  )
}
