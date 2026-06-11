import { useRef, useEffect, useLayoutEffect } from 'react'
import { useNavigationType } from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext'
import { SM_BREAKPOINT } from './useIsDesktop'

export function useMapRestoration() {
  const navType = useNavigationType()
  const { selectedId, setDrawerOpen } = useAppContext()

  // Capture at mount time — restoration only applies to the initial render after back navigation
  const shouldRestore = useRef(navType === 'POP' && !!selectedId)

  useLayoutEffect(() => {
    if (!shouldRestore.current) return
    document.getElementById('conjuntos')?.scrollIntoView({ behavior: 'instant' })
  }, [])

  useEffect(() => {
    if (!shouldRestore.current) return
    if (!window.matchMedia(SM_BREAKPOINT).matches) {
      setDrawerOpen(true)
    }
  }, [setDrawerOpen])
}
