import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { ActividadPage } from './pages/ActividadPage'
import { AppProvider } from './contexts/AppContext'
import { pageVariants } from './utils/pageTransition'
import './App.css'

export default function App() {
  const location = useLocation()
  const navType = useNavigationType()
  const isBack = navType === 'POP'

  return (
    <AppProvider>
      <Navbar />
      <AnimatePresence mode="wait" custom={isBack}>
        <motion.div
          key={location.pathname}
          custom={isBack}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/actividades/:id" element={<ActividadPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppProvider>
  )
}
