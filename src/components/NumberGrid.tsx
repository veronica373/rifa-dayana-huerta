import { CSSProperties, memo, useCallback, useMemo } from 'react'
import { FixedSizeGrid, GridChildComponentProps } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { EstadoNumero } from '../lib/types'
import { TOTAL_NUMEROS } from '../lib/types'

export const CODIGO_ESTADO = {
  disponible: 0,
  reservado: 1,
  pagado: 2,
} as const

export const ESTADO_POR_CODIGO: EstadoNumero[] = ['disponible', 'reservado', 'pagado']

const CELL_SIZE = 56

interface ItemData {
  estados: Uint8Array
  columnCount: number
  onSelect: (numero: string) => void
  resaltado: string | null
}

function formatoNumero(index: number): string {
  return index.toString().padStart(4, '0')
}

const estiloPorEstado: Record<EstadoNumero, string> = {
  disponible:
    'bg-estado-disponible border border-estado-disponibleBorder text-rifa-fucsiaDark hover:bg-rifa-fucsiaLight hover:text-white hover:border-rifa-fucsiaLight cursor-pointer',
  reservado: 'bg-estado-reservadoBg text-estado-reservado border border-estado-reservado/40 cursor-not-allowed',
  pagado: 'bg-estado-pagadoBg text-estado-pagado border border-estado-pagado/40 cursor-not-allowed',
}

const Cell = memo(function Cell({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ItemData>) {
  const { estados, columnCount, onSelect, resaltado } = data
  const index = rowIndex * columnCount + columnIndex
  if (index >= TOTAL_NUMEROS) {
    return <div style={style} />
  }
  const numero = formatoNumero(index)
  const estado = ESTADO_POR_CODIGO[estados[index]]
  const esResaltado = resaltado === numero

  const innerStyle: CSSProperties = {
    margin: 3,
    width: CELL_SIZE - 6,
    height: CELL_SIZE - 6,
  }

  return (
    <div style={style}>
      <button
        type="button"
        style={innerStyle}
        disabled={estado !== 'disponible'}
        onClick={() => onSelect(numero)}
        title={`Número ${numero} — ${estado}`}
        className={[
          'flex items-center justify-center rounded-lg text-xs font-semibold font-mono transition-transform',
          estiloPorEstado[estado],
          esResaltado ? 'ring-4 ring-rifa-lavanda scale-110 z-10 relative' : '',
        ].join(' ')}
      >
        {numero}
      </button>
    </div>
  )
})

interface NumberGridProps {
  estados: Uint8Array
  onSelect: (numero: string) => void
  resaltado: string | null
}

export default function NumberGrid({ estados, onSelect, resaltado }: NumberGridProps) {
  const handleSelect = useCallback((numero: string) => onSelect(numero), [onSelect])

  return (
    <div className="w-full h-[60vh] min-h-[360px] rounded-2xl bg-white/70 border border-rifa-rosaPastel shadow-soft p-2">
      <AutoSizer>
        {({ width, height }) => {
          const columnCount = Math.max(1, Math.floor(width / CELL_SIZE))
          const rowCount = Math.ceil(TOTAL_NUMEROS / columnCount)
          const itemData: ItemData = { estados, columnCount, onSelect: handleSelect, resaltado }
          return (
            <FixedSizeGrid
              columnCount={columnCount}
              columnWidth={CELL_SIZE}
              rowCount={rowCount}
              rowHeight={CELL_SIZE}
              width={width}
              height={height}
              itemData={itemData}
            >
              {Cell}
            </FixedSizeGrid>
          )
        }}
      </AutoSizer>
    </div>
  )
}
