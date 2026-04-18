import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './components/Toast'
import RotaProtegida from './components/RotaProtegida'
import Layout from './pages/Layout'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/Dashboard'
import Prontuario from './modules/Prontuario'
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
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={
              <RotaProtegida>
                <Layout />
              </RotaProtegida>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/prontuario" element={<Prontuario />} />
              <Route path="/orcamento" element={<Orcamento />} />
              <Route path="/receituario" element={<Receituario />} />
              <Route path="/atestado" element={<Atestado />} />
              <Route path="/exames" element={<Exames />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
