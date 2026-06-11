import type { Variants } from 'framer-motion'

export const pageVariants: Variants = {
  initial: (back: boolean) => ({
    x: back ? -32 : 32,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (back: boolean) => ({
    x: back ? 32 : -32,
    opacity: 0,
    transition: { duration: 0.16, ease: [0.55, 0, 1, 0.45] },
  }),
}
