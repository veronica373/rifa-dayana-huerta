export type EstadoNumero = 'disponible' | 'reservado' | 'pagado'

export interface NumeroRifa {
  numero: string
  estado: EstadoNumero
  comprador_nombre: string | null
  comprador_telefono: string | null
  comprador_correo: string | null
  codigo_ticket: string | null
  fecha: string | null
  metodo_pago: string | null
  referido_por: string | null
  notas: string | null
}

export const PRECIO_NUMERO = 5
export const TOTAL_NUMEROS = 10000
export const NOMBRE_BENEFICIARIA = 'Dayana Huerta'

export const METODOS_PAGO = ['Zelle', 'Binance', 'Euro/Transferencia', 'Banco Provincial', 'Efectivo', 'Otro'] as const
