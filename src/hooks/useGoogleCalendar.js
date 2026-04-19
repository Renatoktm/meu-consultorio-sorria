import { useState, useEffect, useCallback, useRef } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const LS_KEY = 'gc_access_token'
const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

export function useGoogleCalendar() {
  const { user } = useAuth()
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(LS_KEY) || null)
  const [isConnected, setIsConnected] = useState(() => !!localStorage.getItem(LS_KEY))
  const [loading, setLoading] = useState(false)
  // Ref so callbacks always see the latest token without being recreated
  const tokenRef = useRef(accessToken)

  useEffect(() => {
    tokenRef.current = accessToken
  }, [accessToken])

  useEffect(() => {
    if (!user) return
    supabase
      .from('clinicas')
      .select('google_access_token, google_calendar_connected')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.google_calendar_connected && data?.google_access_token) {
          tokenRef.current = data.google_access_token
          setAccessToken(data.google_access_token)
          setIsConnected(true)
          localStorage.setItem(LS_KEY, data.google_access_token)
        }
      })
  }, [user])

  const connectGoogle = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar',
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token
      tokenRef.current = token
      setAccessToken(token)
      setIsConnected(true)
      localStorage.setItem(LS_KEY, token)
      if (user) {
        await supabase.from('clinicas').upsert(
          { user_id: user.id, google_access_token: token, google_calendar_connected: true },
          { onConflict: 'user_id' },
        )
      }
    },
    onError: (err) => console.error('Google login error:', err),
  })

  const disconnectGoogle = useCallback(async () => {
    tokenRef.current = null
    setAccessToken(null)
    setIsConnected(false)
    localStorage.removeItem(LS_KEY)
    if (user) {
      await supabase.from('clinicas').upsert(
        { user_id: user.id, google_access_token: null, google_calendar_connected: false },
        { onConflict: 'user_id' },
      )
    }
  }, [user])

  const getEvents = useCallback(async (dateMin, dateMax) => {
    const token = tokenRef.current
    if (!token) return []
    setLoading(true)
    try {
      const params = new URLSearchParams({
        timeMin: dateMin,
        timeMax: dateMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
      })
      const res = await fetch(`${CALENDAR_BASE}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 401) {
          tokenRef.current = null
          setIsConnected(false)
          setAccessToken(null)
          localStorage.removeItem(LS_KEY)
        }
        return []
      }
      const data = await res.json()
      return data.items || []
    } finally {
      setLoading(false)
    }
  }, []) // stable — reads token via ref

  const createEvent = useCallback(async (event) => {
    const token = tokenRef.current
    if (!token) throw new Error('Não conectado ao Google Calendar')
    const res = await fetch(CALENDAR_BASE, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
    if (!res.ok) throw new Error('Erro ao criar evento')
    return res.json()
  }, [])

  const deleteEvent = useCallback(async (eventId) => {
    const token = tokenRef.current
    if (!token) throw new Error('Não conectado ao Google Calendar')
    const res = await fetch(`${CALENDAR_BASE}/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok && res.status !== 204) throw new Error('Erro ao deletar evento')
  }, [])

  return { isConnected, loading, connectGoogle, disconnectGoogle, getEvents, createEvent, deleteEvent }
}
