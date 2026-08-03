import type { NumeroRifa } from './types'

function escapeCsvField(value: string | null): string {
  const text = value ?? ''
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function exportParticipantesCsv(participantes: NumeroRifa[], filename = 'rifa-dayana-huerta-participantes.csv') {
  const encabezados = ['numero', 'nombre', 'telefono', 'correo', 'estado', 'codigo_ticket', 'fecha']
  const filas = participantes.map((p) =>
    [p.numero, p.comprador_nombre, p.comprador_telefono, p.comprador_correo, p.estado, p.codigo_ticket, p.fecha]
      .map(escapeCsvField)
      .join(',')
  )
  const csv = [encabezados.join(','), ...filas].join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
