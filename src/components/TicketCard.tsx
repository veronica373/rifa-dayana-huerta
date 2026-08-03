import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import type { NumeroRifa } from '../lib/types'
import { CONTACTOS_PAGO, NOMBRE_BENEFICIARIA, PRECIO_NUMERO } from '../lib/types'

interface TicketCardProps {
  filas: NumeroRifa[]
  aviso?: string | null
  onClose: () => void
}

export default function TicketCard({ filas, aviso, onClose }: TicketCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [descargando, setDescargando] = useState(false)

  const primera = filas[0]
  const esMultiple = filas.length > 1
  const total = filas.length * PRECIO_NUMERO
  const fecha = primera.fecha ? new Date(primera.fecha).toLocaleString('es-VE') : ''

  async function handleDescargar() {
    if (!ref.current) return
    setDescargando(true)
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, backgroundColor: '#ffffff' })
      const link = document.createElement('a')
      link.download = esMultiple ? 'ticket-rifa-multiple.png' : `ticket-rifa-${primera.numero}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setDescargando(false)
    }
  }

  const mensajeWhatsapp = esMultiple
    ? `Hola! Soy ${primera.comprador_nombre}. Quiero confirmar mi pago de ${filas.length} números: ${filas
        .map((f) => `${f.numero} (${f.codigo_ticket})`)
        .join(', ')}. Total: $${total} USD.`
    : `Hola! Soy ${primera.comprador_nombre}. Quiero confirmar mi pago del número ${primera.numero} (ticket ${primera.codigo_ticket}).`
  const textoCodificado = encodeURIComponent(mensajeWhatsapp)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm">
        {aviso && (
          <p className="mb-3 rounded-xl bg-white border border-estado-reservado text-estado-reservado px-4 py-2 text-sm font-semibold shadow-soft print:hidden">
            {aviso}
          </p>
        )}
        <div id="ticket-imprimible" ref={ref} className="rounded-2xl overflow-hidden shadow-2xl bg-white">
          <div className="brand-gradient px-6 py-5 text-white text-center">
            <p className="text-xs uppercase tracking-widest opacity-90">Rifa a beneficio de</p>
            <h2 className="font-display text-lg font-bold">{NOMBRE_BENEFICIARIA}</h2>
          </div>
          <div className="px-6 py-6 text-center">
            {esMultiple ? (
              <>
                <p className="text-sm text-neutral-500">Tus números ({filas.length})</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {filas.map((f) => (
                    <span
                      key={f.numero}
                      className="font-display font-extrabold text-lg brand-gradient-text bg-rifa-bg rounded-lg px-2 py-1"
                    >
                      {f.numero}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-500">Tu número</p>
                <p className="font-display text-6xl font-extrabold brand-gradient-text tracking-widest">{primera.numero}</p>
              </>
            )}

            <div className="mt-5 text-left text-sm space-y-1.5 border-t border-dashed border-rifa-rosaPastel pt-4">
              <p>
                <span className="text-neutral-500">Comprador: </span>
                <span className="font-semibold">{primera.comprador_nombre}</span>
              </p>
              <p>
                <span className="text-neutral-500">Teléfono: </span>
                <span className="font-semibold">{primera.comprador_telefono}</span>
              </p>
              {primera.comprador_correo && (
                <p>
                  <span className="text-neutral-500">Correo: </span>
                  <span className="font-semibold">{primera.comprador_correo}</span>
                </p>
              )}
              <p>
                <span className="text-neutral-500">Monto: </span>
                <span className="font-semibold">${total} USD</span>
              </p>
              <p>
                <span className="text-neutral-500">Fecha: </span>
                <span className="font-semibold">{fecha}</span>
              </p>
              {esMultiple ? (
                <div>
                  <span className="text-neutral-500">Códigos de ticket:</span>
                  <ul className="mt-1 space-y-0.5">
                    {filas.map((f) => (
                      <li key={f.numero} className="font-mono text-xs">
                        {f.numero} — {f.codigo_ticket}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>
                  <span className="text-neutral-500">Código de ticket: </span>
                  <span className="font-mono font-semibold">{primera.codigo_ticket}</span>
                </p>
              )}
            </div>

            <p className="mt-4 text-xs text-neutral-400">
              {esMultiple ? 'Estos números quedan reservados.' : 'Este número queda reservado.'} Confirma tu pago por
              WhatsApp abajo.
            </p>
          </div>
        </div>

        <div className="mt-4 print:hidden">
          <p className="text-center text-sm text-white/90 mb-2">Confirma tu pago por WhatsApp:</p>
          <div className="grid grid-cols-2 gap-3">
            {CONTACTOS_PAGO.map((c) => (
              <a
                key={c.nombre}
                href={`https://wa.me/${c.telefono}?text=${textoCodificado}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center rounded-lg bg-[#25D366] py-2 font-semibold text-white shadow-soft hover:brightness-95"
              >
                {c.nombre} (WhatsApp)
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-lg border border-white/70 bg-white/90 py-2 font-semibold text-rifa-fucsiaDark shadow-soft"
          >
            Imprimir
          </button>
          <button
            onClick={handleDescargar}
            disabled={descargando}
            className="flex-1 rounded-lg brand-gradient py-2 font-semibold text-white shadow-soft disabled:opacity-60"
          >
            {descargando ? 'Generando...' : 'Descargar imagen'}
          </button>
        </div>
        <button onClick={onClose} className="w-full mt-3 text-sm text-white/90 underline print:hidden">
          Cerrar
        </button>
      </div>
    </div>
  )
}
