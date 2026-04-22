import { useState, useEffect, useCallback, useRef } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const LS_KEY = 'gc_access_token'
const LS_EXPIRY_KEY = 'gc_token_expiry'
const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

function getValidLocalToken() {
  const token = localStorage.getItem(LS_KEY)
  if (!token) return null
  const expiry = localStorage.getItem(LS_EXPIRY_KEY)
  if (expiry && Date.now() >= Number(expiry)) return null
  return token
}

function saveToken(token, expiresIn) {
  localStorage.setItem(LS_KEY, token)
  if (expiresIn) {
    // 1 min buffer before actual expiry
    localStorage.setItem(LS_EXPIRY_KEY, String(Date.now() + expiresIn * 1000 - 60_000))
  }
}

function clearToken() {
  localStorage.removeItem(LS_KEY)
  localStorage.removeItem(LS_EXPIRY_KEY)
}

export function useGoogleCalendar() {
  const { user } = useAuth()

  const validToken = getValidLocalToken()
  const hasExpiredToken = !validToken && !!localStorage.getItem(LS_KEY)

  const [accessToken, setAccessToken] = useState(validToken)
  const [isConnected, setIsConnected] = useState(!!validToken)
  // Start as reconnecting if we have an expired token — avoids flash of "connect" button
  const [isReconnecting, setIsReconnecting] = useState(hasExpiredToken)
  const [loading, setLoading] = useState(false)

  const tokenRef = useRef(validToken)
  const hadPreviousConnection = useRef(false)

  useEffect(() => { tokenRef.current = accessToken }, [accessToken])

  function applyToken(token, expiresIn) {
    tokenRef.current = token
    setAccessToken(token)
    setIsConnected(true)
    setIsReconnecting(false)
    saveToken(token, expiresIn)
  }

  const connectGoogle = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar',
    flow: 'implicit',
    onSuccess: async (r) => {
      applyToken(r.access_token, r.expires_in)
      if (user) {
        await supabase.from('clinicas').upsert(
          { user_id: user.id, google_access_token: r.access_token, google_calendar_connected: true },
          { onConflict: 'user_id' },
        )
      }
    },
    onError: (err) => {
      console.error('Google Calendar:', err?.error ?? err)
      setIsReconnecting(false)
    },
    onNonOAuthError: () => setIsReconnecting(false),
  })

  // On user load: check Supabase state and attempt silent reconnect if needed
  useEffect(() => {
    if (!user) return
    supabase
      .from('clinicas')
      .select('google_access_token, google_calendar_connected')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.google_calendar_connected) {
          setIsReconnecting(false)
          return
        }
        hadPreviousConnection.current = true

        const localToken = getValidLocalToken()
        if (localToken) {
          applyToken(localToken, null)
          return
        }

        // Token expired or missing — try silent reconnect (no UI shown to user)
        setIsReconnecting(true)
        connectGoogle({ prompt: 'none', hint: user.email })
      })
  }, [user])

  const disconnectGoogle = useCallback(async () => {
    hadPreviousConnection.current = false
    tokenRef.current = null
    setAccessToken(null)
    setIsConnected(false)
    clearToken()
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
          setAccessToken(null)
          clearToken()
          if (hadPreviousConnection.current) {
            setIsReconnecting(true)
            connectGoogle({ prompt: 'none', hint: user?.email })
          } else {
            setIsConnected(false)
          }
        }
        return []
      }
      const data = await res.json()
      return data.items || []
    } finally {
      setLoading(false)
    }
  }, [user])

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

  return { isConnected, isReconnecting, loading, connectGoogle, disconnectGoogle, getEvents, createEvent, deleteEvent }
}
