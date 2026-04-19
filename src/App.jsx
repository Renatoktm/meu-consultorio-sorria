import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './components/Toast'
import RotaProtegida from './components/RotaProtegida'
import Layout from './pages/Layout'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Configuracoes from './pages/Configuracoes'
import Pacientes from './pages/Pacientes'
import PacienteDetalhe from './pages/PacienteDetalhe'
import Agenda from './modules/Agenda'
import Orcamento from './modules/Orcamento'
import Receituario from './modules/Receituario'
import Atestado from './modules/Atestado'
import Exames from './modules/Exames'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            <Route element={
              <RotaProtegida>
                <Layout />
              </RotaProtegida>
            }>
              <Route path="/dashboard"       element={<Dashboard />} />
              <Route path="/agenda"          element={<Agenda />} />
              <Route path="/pacientes"       element={<Pacientes />} />
              <Route path="/pacientes/:id"   element={<PacienteDetalhe />} />
              <Route path="/orcamento"       element={<Orcamento />} />
              <Route path="/configuracoes"   element={<Configuracoes />} />
              {/* Rotas legadas mantidas */}
              <Route path="/prontuario"      element={<Navigate to="/pacientes" replace />} />
              <Route path="/receituario"     element={<Receituario />} />
              <Route path="/atestado"        element={<Atestado />} />
              <Route path="/exames"          element={<Exames />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
