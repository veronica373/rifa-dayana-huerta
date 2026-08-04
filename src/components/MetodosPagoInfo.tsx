import { METODOS_PAGO_INFO } from '../lib/types'

export default function MetodosPagoInfo() {
  return (
    <section className="rounded-2xl bg-white/90 shadow-soft border border-rifa-rosaPastel overflow-hidden">
      <div className="brand-gradient px-4 py-2 text-center">
        <h2 className="font-display text-sm font-bold text-white uppercase tracking-widest">Métodos de pago</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-rifa-rosaPastel/60">
        {METODOS_PAGO_INFO.map((m) => (
          <div key={m.metodo} className="px-4 py-3 text-center">
            <p className="text-2xl">{m.bandera}</p>
            <p className="font-display font-bold text-rifa-fucsiaDark">{m.metodo}</p>
            <p className="text-xs text-neutral-400 mb-1">{m.pais}</p>
            <div className="text-xs text-neutral-600 space-y-0.5">
              {m.detalles.map((d) => (
                <p key={d}>{d}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
