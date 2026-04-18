import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePacientes() {
  const { user } = useAuth()
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPacientes = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('pacientes')
      .select('*')
      .eq('user_id', user.id)
      .order('nome')
    setPacientes(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchPacientes() }, [fetchPacientes])

  async function addPaciente(dados) {
    const { data, error } = await supabase
      .from('pacientes')
      .insert({ ...dados, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setPacientes(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
    return data
  }

  async function updatePaciente(id, dados) {
    const { data, error } = await supabase
      .from('pacientes')
      .update(dados)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPacientes(prev => prev.map(p => p.id === id ? data : p))
    return data
  }

  async function deletePaciente(id) {
    const { error } = await supabase.from('pacientes').delete().eq('id', id)
    if (error) throw error
    setPacientes(prev => prev.filter(p => p.id !== id))
  }

  return { pacientes, loading, addPaciente, updatePaciente, deletePaciente, refetch: fetchPacientes }
}
