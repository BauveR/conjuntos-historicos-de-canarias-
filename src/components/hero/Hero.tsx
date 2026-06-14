import rawMonumental from '../../assets/skyline monumental-01.svg?raw'
import rawPopular from '../../assets/skyline popular canarias-01.svg?raw'
import { SkylineCanvas } from './SkylineCanvas'

export function Hero() {
  return (
    <section
      className="h-[80vh] flex justify-center px-8 sm:px-16"
      style={{ background: 'linear-gradient(to bottom, #c36414, #d6a103)' }}
    >
      <div className="my-auto flex flex-col items-center w-fit gap-6">
        <SkylineCanvas svg={rawMonumental} prefix="sm" className="w-full" />
        <h1
          className="text-center text-3xl sm:text-4xl lg:text-5xl font-thin text-white uppercase tracking-widest"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}
        >
          Conjuntos Históricos de Canarias
        </h1>
        <SkylineCanvas svg={rawPopular} prefix="sp" className="w-full" />
      </div>
    </section>
  )
}
