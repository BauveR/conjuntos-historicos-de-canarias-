import { useParallax } from '../../hooks/useParallax'
import { labelStyle, titleStyle } from '../../styles/typography'

type HeroSectionProps = {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle?: string
  ctaLabel?: string
  onCtaClick?: () => void
}

export function HeroSection({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
}: HeroSectionProps) {
  const parallaxRef = useParallax<HTMLDivElement>(0.35)

  return (
    <section className="relative h-svh overflow-hidden">

      {/* Imagen con parallax — 40% más alta que el viewport para absorber el desplazamiento */}
      <div
        ref={parallaxRef}
        className="absolute inset-x-0 -top-[20%] -bottom-[20%] will-change-transform"
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Degradado de profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/65" />

      {/* Contenido anclado al fondo-izquierda — estilo Loewe */}
      <div className="relative h-full flex flex-col justify-end px-8 pb-14 sm:px-16 sm:pb-20">
        <h1
          className="text-[4vw] sm:text-[3.5vw] md:text-[3vw] font-thin text-white uppercase tracking-tight leading-none mb-4 whitespace-nowrap"
          style={titleStyle}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-white/75 text-sm sm:text-base mb-10 max-w-md"
            style={labelStyle}
          >
            {subtitle}
          </p>
        )}

        {ctaLabel && (
          <button
            onClick={onCtaClick}
            className="w-fit px-8 py-3 border border-white/80 text-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer"
            style={labelStyle}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </section>
  )
}
