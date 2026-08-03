export type EstadoNumero = 'disponible' | 'reservado' | 'pagado'

export interface NumeroRifa {
  numero: string
  estado: EstadoNumero
  comprador_nombre: string | null
  comprador_telefono: string | null
  comprador_correo: string | null
  codigo_ticket: string | null
  fecha: string | null
}

export const PRECIO_NUMERO = 5
export const TOTAL_NUMEROS = 10000
export const NOMBRE_BENEFICIARIA = 'Dayana Huerta'
