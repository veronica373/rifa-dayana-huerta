import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { fetchAllNumeros } from '../lib/fetchAllNumeros'
import type { EstadoNumero, NumeroRifa } from '../lib/types'
import { NOMBRE_BENEFICIARIA, PRECIO_NUMERO, TOTAL_NUMEROS } from '../lib/types'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import ParticipantsTable from '../components/ParticipantsTable'
import AdminEditModal from '../components/AdminEditModal'
import { exportParticipantesCsv } from '../lib/exportCsv'

type Filtro = 'todos' | EstadoNumero

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [sesion, setSesion] = useState<Session | null | undefined>(undefined)
  const [verificandoAdmin, setVerificandoAdmin] = useState(true)
  const [numeros, setNumeros] = useState<Map<string, NumeroRifa>>(new Map())
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [procesando, setProcesando] = useState<string | null>(null)
  const [editando, setEditando] = useState<NumeroRifa | null>(null)
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setSesion(null)
        setVerificandoAdmin(false)
        navigate('/admin/login')
        return
      }
      const { data: adminRow } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', data.session.user.id)
        .maybeSingle()
      if (!adminRow) {
        await supabase.auth.signOut()
        setSesion(null)
        setVerificandoAdmin(false)
        navigate('/admin/login')
        return
      }
      setSesion(data.session)
      setVerificandoAdmin(false)
    })
  }, [navigate])

  useEffect(() => {
    if (!sesion) return
    let activo = true

    async function cargar() {
      try {
        const { data, error } = await fetchAllNumeros<NumeroRifa>('*')
        if (!activo) return
        if (error) {
          console.error(error)
          return
        }
        const mapa = new Map<string, NumeroRifa>()
        for (const fila of data ?? []) mapa.set(fila.numero, fila as NumeroRifa)
        setNumeros(mapa)
      } catch (err) {
        console.error('No se pudo conectar con Supabase:', err)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

    const canal = supabase
      .channel('numeros-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'numeros' }, (payload) => {
        const fila = payload.new as NumeroRifa
        if (!fila?.numero) return
        setNumeros((prev) => {
          const copia = new Map(prev)
          copia.set(fila.numero, fila)
          return copia
        })
      })
      .subscribe()

    return () => {
      activo = false
      supabase.removeChannel(canal)
    }
  }, [sesion])

  const listaCompleta = useMemo(() => Array.from(numeros.values()), [numeros])

  const contadores = useMemo(() => {
    let disponible = 0
    let reservado = 0
    let pagado = 0
    for (const f of listaCompleta) {
      if (f.estado === 'disponible') disponible++
      else if (f.estado === 'reservado') reservado++
      else pagado++
    }
    return { disponible, reservado, pagado }
  }, [listaCompleta])

  const participantes = useMemo(
    () => listaCompleta.filter((f) => f.estado !== 'disponible'),
    [listaCompleta]
  )

  const filasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return participantes.filter((f) => {
      if (filtro !== 'todos' && f.estado !== filtro) return false
      if (!q) return true
      return (
        f.numero.includes(q) ||
        (f.comprador_nombre ?? '').toLowerCase().includes(q) ||
        (f.comprador_telefono ?? '').toLowerCase().includes(q) ||
        (f.comprador_correo ?? '').toLowerCase().includes(q)
      )
    })
  }, [participantes, filtro, busqueda])

  const porcentajeVendido = (contadores.pagado / TOTAL_NUMEROS) * 100
  const montoRecaudado = contadores.pagado * PRECIO_NUMERO
  const montoPendiente = contadores.reservado * PRECIO_NUMERO

  async function handleMarcarPagado(numero: string) {
    setProcesando(numero)
    try {
      await supabase.rpc('marcar_pagado', { p_numero: numero })
    } catch (err) {
      console.error(err)
    } finally {
      setProcesando(null)
    }
  }

  async function handleLiberar(numero: string) {
    if (!confirm(`¿Liberar el número ${numero}? Volverá a estar disponible y se perderán sus datos de comprador.`)) return
    setProcesando(numero)
    try {
      await supabase.rpc('liberar_numero', { p_numero: numero })
    } catch (err) {
      console.error(err)
    } finally {
      setProcesando(null)
    }
  }

  async function handleGuardarEdicion(datos: { nombre: string; telefono: string; correo: string; estado: EstadoNumero }) {
    if (!editando) return
    setProcesando(editando.numero)
    setErrorEdicion(null)
    try {
      const { error } = await supabase.rpc('registrar_manual', {
        p_numero: editando.numero,
        p_nombre: datos.nombre,
        p_telefono: datos.telefono,
        p_correo: datos.correo,
        p_estado: datos.estado,
      })
      if (error) {
        setErrorEdicion('No se pudo guardar. Intenta de nuevo.')
        return
      }
      setEditando(null)
    } catch (err) {
      console.error(err)
      setErrorEdicion('No se pudo conectar. Intenta de nuevo.')
    } finally {
      setProcesando(null)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (verificandoAdmin || sesion === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-neutral-500">Verificando acceso...</div>
  }

  if (!sesion) return null

  return (
    <div className="min-h-screen">
      <header className="brand-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <p className="uppercase tracking-widest text-xs font-semibold opacity-90">Panel de administración</p>
            <h1 className="font-display text-2xl font-extrabold">Rifa de {NOMBRE_BENEFICIARIA}</h1>
          </div>
          <button onClick={handleLogout} className="text-sm underline text-white/90 hover:text-white">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {cargando ? (
          <div className="text-center py-20 text-neutral-500">Cargando datos...</div>
        ) : (
          <>
            <section className="rounded-2xl bg-white/80 shadow-soft border border-rifa-rosaPastel p-5">
              <ProgressBar
                porcentaje={porcentajeVendido}
                label="Porcentaje vendido"
                sublabel={`${porcentajeVendido.toFixed(2)}% · ${contadores.pagado.toLocaleString('es')} / ${TOTAL_NUMEROS.toLocaleString('es')}`}
              />
            </section>

            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard titulo="Disponibles" valor={contadores.disponible.toLocaleString('es')} acento="lavanda" />
              <StatCard titulo="Reservados" valor={contadores.reservado.toLocaleString('es')} acento="ambar" />
              <StatCard titulo="Pagados" valor={contadores.pagado.toLocaleString('es')} acento="verde" />
              <StatCard titulo="Recaudado" valor={`$${montoRecaudado.toLocaleString('es')}`} acento="verde" />
              <StatCard titulo="Pendiente (reservado)" valor={`$${montoPendiente.toLocaleString('es')}`} acento="ambar" />
            </section>

            <section className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {(['todos', 'reservado', 'pagado'] as Filtro[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                      filtro === f
                        ? 'brand-gradient text-white border-transparent'
                        : 'border-rifa-rosaPastel text-neutral-600 bg-white'
                    }`}
                  >
                    {f === 'todos' ? 'Todos' : f === 'reservado' ? 'Reservados' : 'Pagados'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar número, nombre, teléfono..."
                  className="rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
                />
                <button
                  onClick={() => exportParticipantesCsv(participantes)}
                  className="rounded-lg brand-gradient px-4 py-2 font-semibold text-white shadow-soft whitespace-nowrap"
                >
                  Exportar CSV
                </button>
              </div>
            </section>

            <ParticipantsTable
              filas={filasFiltradas}
              onMarcarPagado={handleMarcarPagado}
              onLiberar={handleLiberar}
              onEditar={(fila) => {
                setErrorEdicion(null)
                setEditando(fila)
              }}
              procesando={procesando}
            />
          </>
        )}
      </main>

      {editando && (
        <AdminEditModal
          fila={editando}
          enviando={procesando === editando.numero}
          error={errorEdicion}
          onCancel={() => setEditando(null)}
          onSubmit={handleGuardarEdicion}
        />
      )}
    </div>
  )
}
