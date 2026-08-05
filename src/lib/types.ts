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
  referencia_pago: string | null
  comprobante_url: string | null
  pais_compra: string | null
}

export const PRECIO_NUMERO = 5
export const TOTAL_NUMEROS = 1000
export const NOMBRE_BENEFICIARIA = 'Dayana Huerta'
export const MAX_SELECCION = 50

export const METODOS_PAGO = ['Bizum', 'Pago Móvil', 'Zelle', 'Mercado Pago', 'Efectivo', 'Otro'] as const

export const PAISES_COMPRA = ['España', 'Venezuela', 'Estados Unidos', 'Argentina', 'Otro'] as const

export const BUCKET_COMPROBANTES = 'comprobantes'

export interface MetodoPagoInfo {
  pais: string
  bandera: string
  metodo: string
  detalles: string[]
}

export const METODOS_PAGO_INFO: MetodoPagoInfo[] = [
  {
    pais: 'España',
    bandera: '🇪🇸',
    metodo: 'Bizum',
    detalles: ['624 040 067 — Daniela Vidal (Hija)', '641 633 195 — Ronny Meza (Hijo)'],
  },
  {
    pais: 'Venezuela',
    bandera: '🇻🇪',
    metodo: 'Pago Móvil',
    detalles: ['0424-4388455', '20514413', 'Banco Provincial', 'Jorge Meza (Hijo)'],
  },
  {
    pais: 'USA',
    bandera: '🇺🇸',
    metodo: 'Zelle',
    detalles: ['A partir de 30 números', 'Jorge Daniel Meza Huerta (Hijo)'],
  },
  {
    pais: 'Argentina',
    bandera: '🇦🇷',
    metodo: 'Mercado Pago',
    detalles: ['Alias: dervin.huerta', 'Dervin Huerta (Hermano)'],
  },
]

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
