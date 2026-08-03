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
export const TOTAL_NUMEROS = 1000
export const NOMBRE_BENEFICIARIA = 'Dayana Huerta'
export const MAX_SELECCION = 50

export const METODOS_PAGO = ['Zelle', 'Binance', 'Euro/Transferencia', 'Banco Provincial', 'Efectivo', 'Otro'] as const

export interface ContactoPago {
  nombre: string
  // Número de WhatsApp completo con código de país, solo dígitos (sin +, espacios ni guiones).
  telefono: string
}

export const CONTACTOS_PAGO: ContactoPago[] = [
  { nombre: 'Thaidis', telefono: '584144121656' },
  { nombre: 'Laura', telefono: '584124637972' },
  { nombre: 'Marli', telefono: '584143927139' },
  { nombre: 'Daniela', telefono: '34624040067' },
]
