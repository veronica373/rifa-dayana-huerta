import { supabase } from './supabaseClient'

// Supabase/PostgREST limita cada consulta a 1000 filas por defecto. Como la tabla
// "numeros" tiene 10,000 filas, hay que paginar con .range() hasta traerlas todas.
const PAGE_SIZE = 1000

export async function fetchAllNumeros<T>(select: string): Promise<{ data: T[] | null; error: Error | null }> {
  const todas: T[] = []
  let desde = 0

  while (true) {
    const { data, error } = await supabase
      .from('numeros')
      .select(select)
      .order('numero', { ascending: true })
      .range(desde, desde + PAGE_SIZE - 1)

    if (error) return { data: null, error }
    if (!data || data.length === 0) break

    todas.push(...(data as T[]))
    if (data.length < PAGE_SIZE) break
    desde += PAGE_SIZE
  }

  return { data: todas, error: null }
}
