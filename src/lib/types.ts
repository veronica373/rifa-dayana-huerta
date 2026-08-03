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
export const TOTAL_NUMEROS = 2000
export const NOMBRE_BENEFICIARIA = 'Dayana Huerta'

export const METODOS_PAGO = ['Zelle', 'Binance', 'Euro/Transferencia', 'Banco Provincial', 'Efectivo', 'Otro'] as const

export interface ContactoPago {
  nombre: string
  link: string
}

export const CONTACTOS_PAGO: ContactoPago[] = [
  { nombre: 'Thaidis', link: 'https://wa.me/qr/ORALRC7KD63VA1' },
  { nombre: 'Laura', link: 'https://wa.me/qr/JOGU3DMOTWZ4M1' },
]
