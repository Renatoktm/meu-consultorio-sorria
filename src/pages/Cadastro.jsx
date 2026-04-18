import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'

export default function Cadastro() {
  const { signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', clinica: '', cro: '' })
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.senha.length < 6) {
      toast('A senha deve ter pelo menos 6 caracteres.', 'error')
      return
    }
    setLoading(true)
    try {
      await signUp(form.email, form.senha, form.nome, form.clinica, form.cro)
      toast('Conta criada! Verifique seu e-mail para confirmar.', 'success')
      navigate('/login')
    } catch (err) {
      toast(err.message || 'Erro ao criar conta.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🦷</div>
          <h1>Criar conta gratuita</h1>
          <p>Comece com 3 pacientes no plano free</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome completo *</label>
              <input className="form-input" placeholder="Dr. João Silva" value={form.nome} onChange={set('nome')} required />
            </div>
            <div className="form-group">
              <label className="form-label">CRO</label>
              <input className="form-input" placeholder="SP-12345" value={form.cro} onChange={set('cro')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nome da clínica</label>
            <input className="form-input" placeholder="Clínica Sorriso" value={form.clinica} onChange={set('clinica')} />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail *</label>
            <input className="form-input" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha *</label>
            <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={set('senha')} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta gratuita'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
