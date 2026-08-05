import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { fetchAllNumeros } from '../lib/fetchAllNumeros'
import type { EstadoNumero, NumeroRifa } from '../lib/types'
import { BUCKET_COMPROBANTES, MAX_SELECCION, NOMBRE_BENEFICIARIA, PRECIO_NUMERO, TOTAL_NUMEROS } from '../lib/types'
import NumberGrid, { CODIGO_ESTADO } from '../components/NumberGrid'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import BuyerFormModal, { DatosCompra } from '../components/BuyerFormModal'
import TicketCard from '../components/TicketCard'
import SeleccionBar from '../components/SeleccionBar'
import MetodosPagoInfo from '../components/MetodosPagoInfo'

const MENSAJES_ERROR: Record<string, string> = {
  NUMERO_NO_DISPONIBLE: 'Justo alguien más tomó este número. Elige otro disponible.',
  NOMBRE_REQUERIDO: 'Escribe tu nombre completo.',
  TELEFONO_REQUERIDO: 'Escribe tu teléfono (WhatsApp).',
}

export default function PublicPage() {
  const estadosRef = useRef<Uint8Array>(new Uint8Array(TOTAL_NUMEROS))
  const [, setTick] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [resaltado, setResaltado] = useState<string | null>(null)
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [avisoLimite, setAvisoLimite] = useState(false)
  const [numerosReservando, setNumerosReservando] = useState<string[] | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [errorReserva, setErrorReserva] = useState<string | null>(null)
  const [ticket, setTicket] = useState<NumeroRifa[] | null>(null)
  const [avisoTicket, setAvisoTicket] = useState<string | null>(null)
  const [contadores, setContadores] = useState({ disponible: TOTAL_NUMEROS, reservado: 0, pagado: 0 })

  const forceRender = useCallback(() => setTick((t) => t + 1), [])

  const recalcularContadores = useCallback(() => {
    let disponible = 0
    let reservado = 0
    let pagado = 0
    const arr = estadosRef.current
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === CODIGO_ESTADO.disponible) disponible++
      else if (arr[i] === CODIGO_ESTADO.reservado) reservado++
      else pagado++
    }
    setContadores({ disponible, reservado, pagado })
  }, [])

  useEffect(() => {
    let activo = true

    async function cargarInicial() {
      try {
        const { data, error } = await fetchAllNumeros<{ numero: string; estado: EstadoNumero }>('numero, estado')
        if (!activo) return
        if (error) {
          console.error(error)
          return
        }
        const arr = estadosRef.current
        for (const fila of data ?? []) {
          const idx = parseInt(fila.numero, 10)
          arr[idx] = CODIGO_ESTADO[fila.estado as EstadoNumero]
        }
        recalcularContadores()
        forceRender()
      } catch (err) {
        console.error('No se pudo conectar con Supabase:', err)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarInicial()

    const canal = supabase
      .channel('numeros-publico')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'numeros' },
        (payload) => {
          const fila = payload.new as NumeroRifa
          const idx = parseInt(fila.numero, 10)
          estadosRef.current[idx] = CODIGO_ESTADO[fila.estado]
          recalcularContadores()
          forceRender()
          if (fila.estado !== 'disponible') {
            setSeleccionados((prev) => {
              if (!prev.has(fila.numero)) return prev
              const copia = new Set(prev)
              copia.delete(fila.numero)
              return copia
            })
          }
        }
      )
      .subscribe()

    return () => {
      activo = false
      supabase.removeChannel(canal)
    }
  }, [forceRender, recalcularContadores])

  const porcentajeAvance = useMemo(
    () => ((contadores.reservado + contadores.pagado) / TOTAL_NUMEROS) * 100,
    [contadores]
  )

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    const limpio = busqueda.trim()
    if (!/^\d{1,4}$/.test(limpio)) return
    const numero = limpio.padStart(4, '0')
    setResaltado(numero)
  }

  function handleSeleccionar(numero: string) {
    setSeleccionados((prev) => {
      const copia = new Set(prev)
      if (copia.has(numero)) {
        copia.delete(numero)
        setAvisoLimite(false)
      } else {
        if (copia.size >= MAX_SELECCION) {
          setAvisoLimite(true)
          return prev
        }
        setAvisoLimite(false)
        copia.add(numero)
      }
      return copia
    })
  }

  function handleAbrirFormulario() {
    if (seleccionados.size === 0) return
    setErrorReserva(null)
    setNumerosReservando(Array.from(seleccionados))
  }

  async function handleConfirmarReserva(datos: DatosCompra) {
    if (!numerosReservando || numerosReservando.length === 0) return
    setEnviando(true)
    setErrorReserva(null)
    try {
      let rutaComprobante: string | null = null
      if (datos.comprobante) {
        const extension = datos.comprobante.name.split('.').pop() || 'jpg'
        rutaComprobante = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
        const { error: errorSubida } = await supabase.storage
          .from(BUCKET_COMPROBANTES)
          .upload(rutaComprobante, datos.comprobante)
        if (errorSubida) {
          setErrorReserva('No se pudo subir la captura del comprobante. Intenta de nuevo.')
          return
        }
      }

      const { data, error } = await supabase.rpc('reservar_numeros_lote', {
        p_numeros: numerosReservando,
        p_nombre: datos.nombre,
        p_telefono: datos.telefono,
        p_correo: datos.correo,
        p_metodo_pago: datos.metodoPago,
        p_referencia_pago: datos.referenciaPago,
        p_comprobante_url: rutaComprobante,
        p_pais_compra: datos.pais,
      })
      if (error) {
        const codigo = error.message?.split(':')[0]?.trim()
        setErrorReserva(MENSAJES_ERROR[codigo] ?? 'No se pudo reservar. Intenta de nuevo.')
        return
      }
      const filasReservadas = (data ?? []) as NumeroRifa[]
      for (const fila of filasReservadas) {
        estadosRef.current[parseInt(fila.numero, 10)] = CODIGO_ESTADO.reservado
      }
      recalcularContadores()
      forceRender()

      const numerosFallidos = numerosReservando.filter((n) => !filasReservadas.some((f) => f.numero === n))

      if (filasReservadas.length === 0) {
        setErrorReserva('Justo alguien más tomó esos números. Elige otros disponibles.')
        return
      }

      setSeleccionados(new Set())
      setNumerosReservando(null)
      setAvisoTicket(
        numerosFallidos.length > 0
          ? `Los números ${numerosFallidos.join(', ')} ya no estaban disponibles y no se reservaron. El resto sí se reservó.`
          : null
      )
      setTicket(filasReservadas)
    } catch (err) {
      console.error(err)
      setErrorReserva('No se pudo conectar. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="brand-gradient text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="uppercase tracking-widest text-xs font-semibold opacity-90">Rifa a beneficio de</p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-1">{NOMBRE_BENEFICIARIA}</h1>
          <p className="mt-2 text-sm sm:text-base opacity-95">
            {TOTAL_NUMEROS.toLocaleString('es')} números del 0000 al {(TOTAL_NUMEROS - 1).toString().padStart(4, '0')} · $
            {PRECIO_NUMERO} USD cada uno · Elige uno o varios abajo
          </p>
          <Link
            to="/admin/login"
            className="inline-block mt-4 text-xs underline text-white/80 hover:text-white"
          >
            Acceso administradoras
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <MetodosPagoInfo />

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard titulo="Disponibles" valor={contadores.disponible.toLocaleString('es')} acento="lavanda" />
          <StatCard titulo="Reservados" valor={contadores.reservado.toLocaleString('es')} acento="ambar" />
          <StatCard titulo="Vendidos (pagados)" valor={contadores.pagado.toLocaleString('es')} acento="verde" />
        </section>

        <section className="rounded-2xl bg-white/80 shadow-soft border border-rifa-rosaPastel p-4">
          <ProgressBar
            porcentaje={porcentajeAvance}
            label="Avance de la rifa"
            sublabel={`${(contadores.reservado + contadores.pagado).toLocaleString('es')} / ${TOTAL_NUMEROS.toLocaleString('es')} tomados`}
          />
        </section>

        <section className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <form onSubmit={handleBuscar} className="flex gap-2 flex-1">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar número (ej. 0452)"
              maxLength={4}
              inputMode="numeric"
              className="flex-1 rounded-lg border border-rifa-rosaPastel px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rifa-lavanda"
            />
            <button
              type="submit"
              className="rounded-lg brand-gradient px-4 py-2 font-semibold text-white shadow-soft"
            >
              Buscar
            </button>
          </form>
          <div className="flex gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-estado-disponible border border-estado-disponibleBorder" /> Disponible
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-estado-reservadoBg border border-estado-reservado/40" /> Reservado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-estado-pagadoBg border border-estado-pagado/40" /> Pagado
            </span>
          </div>
        </section>

        <p className="text-sm text-neutral-500 -mt-3">
          Toca un número disponible para agregarlo a tu selección. Puedes elegir varios y reservarlos juntos.
        </p>
        {avisoLimite && (
          <p className="text-sm font-semibold text-estado-reservado">
            Solo puedes seleccionar hasta {MAX_SELECCION} números a la vez.
          </p>
        )}

        {cargando ? (
          <div className="text-center py-20 text-neutral-500">Cargando números...</div>
        ) : (
          <NumberGrid
            estados={estadosRef.current}
            onSelect={handleSeleccionar}
            resaltado={resaltado}
            seleccionados={seleccionados}
          />
        )}
      </main>

      <SeleccionBar
        cantidad={seleccionados.size}
        onReservar={handleAbrirFormulario}
        onVaciar={() => setSeleccionados(new Set())}
      />

      {numerosReservando && (
        <BuyerFormModal
          numeros={numerosReservando}
          enviando={enviando}
          error={errorReserva}
          onCancel={() => setNumerosReservando(null)}
          onSubmit={handleConfirmarReserva}
        />
      )}

      {ticket && (
        <TicketCard
          filas={ticket}
          aviso={avisoTicket}
          onClose={() => {
            setTicket(null)
            setAvisoTicket(null)
          }}
        />
      )}
    </div>
  )
}
