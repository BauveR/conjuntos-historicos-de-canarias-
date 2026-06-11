import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { ActividadPage } from './pages/ActividadPage'
import { ActividadModal } from './components/map/ActividadModal'
import { AppProvider } from './contexts/AppContext'
import { pageVariants } from './utils/pageTransition'
import './App.css'

export default function App() {
  const location = useLocation()
  const navType = useNavigationType()
  const isBack = navType === 'POP'
  const background = location.state?.background as Location | undefined

  return (
    <AppProvider>
      <Navbar />

      {/* Main content — renders background location when modal is open */}
      <AnimatePresence mode="wait" custom={isBack}>
        <motion.div
          key={(background ?? location).pathname}
          custom={isBack}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Routes location={background ?? location}>
            <Route path="/" element={<Home />} />
            <Route path="/actividades/:id" element={<ActividadPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* Modal overlay — desktop only, shown when navigated with background state */}
      <AnimatePresence>
        {background && (
          <Routes key="modal">
            <Route path="/actividades/:id" element={<ActividadModal />} />
          </Routes>
        )}
      </AnimatePresence>
    </AppProvider>
  )
}
