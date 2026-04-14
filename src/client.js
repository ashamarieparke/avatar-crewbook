import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const API_KEY =
	import.meta.env.VITE_SUPABASE_API_KEY ||
	import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(URL && API_KEY)

export const supabase = isSupabaseConfigured
	? createClient(URL, API_KEY)
	: null
