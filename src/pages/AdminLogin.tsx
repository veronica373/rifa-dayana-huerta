import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { NOMBRE_BENEFICIARIA } from '../lib/types'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.session) {
      setCargando(false)
      setError('Correo o contraseña incorrectos.')
      return
    }

    const { data: adminRow } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', data.session.user.id)
      .maybeSingle()

    setCargando(false)

    if (!adminRow) {
      setError('Esta cuenta no tiene permisos de administración.')
      await supabase.auth.signOut()
      return
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-rifa-bg px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-soft border border-rifa-rosaPastel p-6">
        <p className="text-xs uppercase tracking-widest text-neutral-400 text-center">Rifa a beneficio de</p>
        <h1 className="font-display text-xl font-bold brand-gradient-text text-center">{NOMBRE_BENEFICIARIA}</h1>
        <p className="text-sm text-neutral-500 text-center mt-1">Acceso de administración — Thaidis y Daniela</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg brand-gradient py-2 font-semibold text-white shadow-soft disabled:opacity-60"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
