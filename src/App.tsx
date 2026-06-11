import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { ActividadPage } from './pages/ActividadPage'
import './App.css'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/actividades/:id" element={<ActividadPage />} />
      </Routes>
    </>
  )
}
