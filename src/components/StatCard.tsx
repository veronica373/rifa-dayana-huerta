interface StatCardProps {
  titulo: string
  valor: string
  detalle?: string
  acento?: 'fucsia' | 'lavanda' | 'ambar' | 'verde'
}

const acentos: Record<NonNullable<StatCardProps['acento']>, string> = {
  fucsia: 'text-rifa-fucsia',
  lavanda: 'text-rifa-lavanda',
  ambar: 'text-estado-reservado',
  verde: 'text-estado-pagado',
}

export default function StatCard({ titulo, valor, detalle, acento = 'fucsia' }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur px-5 py-4 shadow-soft border border-rifa-rosaPastel">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{titulo}</p>
      <p className={`text-3xl font-display font-extrabold mt-1 ${acentos[acento]}`}>{valor}</p>
      {detalle && <p className="text-xs text-neutral-500 mt-1">{detalle}</p>}
    </div>
  )
}
