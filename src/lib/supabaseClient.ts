import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y coloca tus claves de Supabase.'
  )
}

// Se usa un proyecto de relleno cuando faltan las variables de entorno para que la
// app no truene al cargar (útil en desarrollo antes de configurar Supabase); las
// llamadas simplemente fallarán con un error de red hasta que se configure .env.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key')
