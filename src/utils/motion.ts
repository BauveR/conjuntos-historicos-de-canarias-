import type { Transition } from 'framer-motion'

export const desktopTransition: Transition = { duration: 0.18, ease: 'easeOut' }
export const mobileTransition: Transition = { type: 'spring', damping: 30, stiffness: 300 }

export const sheetVariants = (isDesktop: boolean) => isDesktop
  ? { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 } }
  : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
