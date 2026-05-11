import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const API_KEY =
	import.meta.env.VITE_SUPABASE_API_KEY ||
	import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(URL && API_KEY)

export const supabase = isSupabaseConfigured
	? createClient(URL, API_KEY)
	: null

// Generate or retrieve a unique session ID per browser
// This isolates data per browser/incognito session without requiring login
const SESSION_STORAGE_KEY = 'crewmate_session_id'

export const getSessionId = () => {
	let sessionId = localStorage.getItem(SESSION_STORAGE_KEY)
	if (!sessionId) {
		sessionId = crypto.randomUUID()
		localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
	}
	return sessionId
}
