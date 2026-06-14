import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { ActividadPage } from './pages/ActividadPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { PasaportePage } from './pages/PasaportePage'
import { ContactoPage } from './pages/ContactoPage'
import { ActividadModal } from './components/map/ActividadModal'
import { AuthModal } from './components/auth/AuthModal'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DataProvider } from './contexts/DataContext'
import { MapUIProvider } from './contexts/MapUIContext'
import { AuthProvider } from './contexts/AuthContext'
import { pageVariants } from './utils/pageTransition'
import './App.css'

export default function App() {
  const location = useLocation()
  const navType = useNavigationType()
  const isBack = navType === 'POP'
  const background = location.state?.background as Location | undefined

  return (
    <AuthProvider>
      <DataProvider>
      <MapUIProvider>
        <Navbar />

        {/* Main content — renders background location when modal is open */}
        <AnimatePresence>
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
              <Route path="/login" element={<AuthPage />} />
              <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />
              <Route path="/pasaporte" element={<PasaportePage />} />
              <Route path="/contacto" element={<ContactoPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>

        {/* Modal overlay — shown when navigated with background state */}
        <AnimatePresence>
          {background && (
            <Routes key="modal">
              <Route path="/actividades/:id" element={<ActividadModal />} />
              <Route path="/login" element={<AuthModal />} />
              <Route path="*" element={null} />
            </Routes>
          )}
        </AnimatePresence>
      </MapUIProvider>
      </DataProvider>
    </AuthProvider>
  )
}
