import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import rawMonumental from '../../assets/skyline monumental-01.svg?raw'
import rawPopular from '../../assets/skyline popular canarias-01.svg?raw'
import { SkylineCanvas } from './SkylineCanvas'
import Grainient from './Grainient'
import SplitText from './SplitText'
import Strands from './Strands'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const scale   = useTransform(scrollYProgress, [0, 1], [1, 0.4])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={sectionRef}
      className="relative h-[80vh] overflow-hidden flex justify-center px-2 sm:px-16"
    >
      {/* fondo */}
      <div className="absolute inset-0">
        <Grainient
          color1="#9c4835"
          color2="#b19e7b"
          color3="#595d8d"
          timeSpeed={0.22}
          colorBalance={0}
          warpStrength={1.9}
          warpFrequency={5}
          warpSpeed={3.0}
          warpAmplitude={14}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.14}
          grainScale={2}
          grainAnimated={false}
          contrast={1.7}
          gamma={1}
          saturation={0.85}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      {/* único padre de todos los elementos visibles */}
      <div className="relative z-10 my-auto flex flex-col items-center w-full max-w-[900px] gap-6">

        {/* rayo — absolute dentro del padre, z negativo para quedar detrás del contenido */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1]">
          <div className="w-[55%] h-[88px] sm:w-full sm:h-64 max-w-2xl translate-y-6">
            <Strands
              colors={["#f9f5f0", "#9c4835", "#595d8d"]}
              count={1}
              speed={0.4}
              amplitude={0.2}
              waviness={1}
              thickness={0.5}
              glow={0.7}
              taper={1.5}
              spread={0}
              intensity={0.6}
              saturation={1.5}
              opacity={1}
              scale={2.6}
            />
          </div>
        </div>

        <SkylineCanvas svg={rawMonumental} prefix="sm" className="w-full" />

        <motion.h1
          style={{ scale, opacity, fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 400", color: '#f9f5f0' }}
          className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-normal uppercase tracking-widest text-center"
        >
          <SplitText
            text="Conjuntos Históricos de Canarias"
            tag="span"
            splitType="chars"
            delay={60}
            duration={1.0}
            ease="power3.out"
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="0px"
            textAlign="center"
          />
        </motion.h1>

        <SkylineCanvas svg={rawPopular} prefix="sp" className="w-full" />

        <a
          href="/#actividades"
          className="px-6 py-2.5 rounded-full text-[11px] tracking-widest uppercase text-white transition-opacity hover:opacity-80 whitespace-nowrap"
          style={{ backgroundColor: '#595d8d', fontFamily: "'Open Sans', sans-serif" }}
        >
          Explorar actividades
        </a>
      </div>
    </section>
  )
}
