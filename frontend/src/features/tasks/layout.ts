export interface Layout { order?: [number, 'asc' | 'desc'][]; columns?: { visible: boolean }[]; ColReorder?: number[] }
export function decodeLayout(raw: unknown): Layout {
  try {
    const state = JSON.parse(String(raw ?? '{}'))
    const positions: number[] = Array.isArray(state.ColReorder) ? state.ColReorder.filter((i: unknown) => Number.isInteger(i) && Number(i) >= 0) : []
    if (new Set(positions).size !== positions.length) return {}
    const columns: { visible: boolean }[] = []
    if (Array.isArray(state.columns)) state.columns.forEach((column: { visible?: boolean }, i: number) => { columns[positions[i] ?? i] = { visible: column?.visible !== false } })
    const order = Array.isArray(state.order) ? state.order.filter((entry: unknown) => Array.isArray(entry) && Number.isInteger(entry[0]) && ['asc', 'desc'].includes(entry[1])).map(([index, direction]: [number, 'asc' | 'desc']) => [positions[index] ?? index, direction] as [number, 'asc' | 'desc']) : undefined
    return { columns, order, ColReorder: positions.length ? positions : undefined }
  } catch { return {} }
}
export function encodeLayout(layout: Layout): string {
  const positions = layout.ColReorder
  return JSON.stringify({ ...layout,
    columns: positions ? positions.map(i => layout.columns?.[i] ?? { visible: true }) : layout.columns,
    order: layout.order?.map(([index, direction]) => [positions ? positions.indexOf(index) : index, direction]),
    search: { search: '', regex: false, smart: true, caseInsensitive: true },
  })
}
