import { useParallax } from '../../hooks/useParallax'

type HeroSplitProps = {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle?: string
  ctaLabel?: string
  onCtaClick?: () => void
}

export function HeroSplit({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
}: HeroSplitProps) {
  const parallaxRef = useParallax<HTMLDivElement>(0.2)

  return (
    <section className="h-auto sm:h-[92svh] bg-stone-50 px-4 sm:px-10 lg:px-16 pt-4 sm:pt-8 mb-[-1px]">
      <div className="flex flex-col sm:flex-row h-full overflow-hidden rounded-none">

      {/* Columna izquierda — imagen */}
      <div className="relative h-[55svh] sm:h-auto sm:w-[58%] shrink-0 overflow-hidden">
        <div
          ref={parallaxRef}
          className="absolute inset-x-0 -top-[15%] -bottom-[15%] will-change-transform"
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Columna derecha — texto */}
      <div className="flex flex-1 flex-col justify-end px-8 py-12 sm:px-12 sm:pb-20 bg-stone-50">
        <h1
          className="text-[7vw] sm:text-[3.8vw] md:text-[3.2vw] font-thin text-stone-900 uppercase tracking-tight leading-tight mb-6"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-stone-500 text-sm sm:text-base mb-10 max-w-xs leading-relaxed"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            {subtitle}
          </p>
        )}

        {ctaLabel && (
          <button
            onClick={onCtaClick}
            className="w-fit px-8 py-3 border border-stone-900 text-stone-900 text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-colors duration-300 cursor-pointer"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            {ctaLabel}
          </button>
        )}
      </div>

      </div>
    </section>
  )
}
