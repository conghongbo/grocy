import { useState } from 'react'
import { grocy } from '../api/grocy'
import { configuration } from '../api/client'
import { useResource, useAction } from '../components/Resource'
const load = async (signal: AbortSignal) => {
  const [stock, products, units, locations] = await Promise.all([grocy.stock(signal), grocy.products(signal), grocy.objects('quantity_units', signal), grocy.objects('locations', signal)])
  return { stock, products, units, locations }
}
export default function StockPage({ inventory = false }: { inventory?: boolean }) {
  const resource = useResource(load)
  const action = useAction(resource.refresh)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const [operation, setOperation] = useState<'consume' | 'open' | 'add' | 'inventory'>(inventory ? 'inventory' : 'consume')
  return <section><h1>{inventory ? 'Inventory' : 'Stock overview'}</h1>
    <p><a href={`${configuration.legacyUrl}/stockoverview`}>Advanced stock workflows</a></p>
    <label>Search products <input value={query} onChange={e => setQuery(e.target.value)} type="search" /></label>
    <button onClick={resource.refresh} disabled={resource.loading}>Refresh</button>
    {resource.loading && <p role="status">Loading stock…</p>}{resource.error && <p role="alert" className="error">{resource.error}</p>}
    {action.feedback}
    {resource.data && <><div className="table-scroll"><table><thead><tr><th>Product</th><th>Amount</th><th>Opened</th><th>Best before</th><th>Location</th><th>Action</th></tr></thead><tbody>
      {resource.data.products.filter(p => Number(p.active ?? 1) === 1 && p.name.toLowerCase().includes(query.toLowerCase())).map(p => {
        const stock = resource.data!.stock.find(s => String(s.product_id) === String(p.id))
        const unit = resource.data!.units.find(u => String(u.id) === String(p.qu_id_stock))?.name
        return <tr key={p.id}><th scope="row">{p.name}</th><td>{stock?.amount ?? 0} {unit}</td><td>{stock?.amount_opened ?? 0}</td><td>{stock?.best_before_date ?? '—'}</td><td>{resource.data!.locations.find(l => String(l.id) === String(p.location_id))?.name}</td><td><button disabled={action.busy} onClick={() => setSelected(String(p.id))}>{inventory ? 'Count' : 'Update'}</button></td></tr>
      })}</tbody></table></div>
      {selected && <form key={selected} onSubmit={e => {
        e.preventDefault(); const form = new FormData(e.currentTarget)
        const amount = Number(form.get('amount'))
        const body = { [operation === 'inventory' ? 'new_amount' : 'amount']: amount, ...(form.get('location') ? { location_id: Number(form.get('location')) } : {}), ...(form.get('date') ? { best_before_date: form.get('date') } : {}) }
        void action.run(() => grocy.stockAction(selected, operation, body))
      }}><h2>{resource.data.products.find(p => String(p.id) === selected)?.name}</h2>
        <label>Operation <select value={operation} onChange={e => setOperation(e.target.value as typeof operation)}><option value="consume">Consume</option><option value="open">Open</option><option value="add">Purchase</option><option value="inventory">Set inventory count</option></select></label>
        <label>{operation === 'inventory' ? 'New total amount' : 'Amount'} <input name="amount" type="number" min={operation === 'inventory' ? 0 : 0.000001} step="any" required defaultValue="1" /></label>
        {(operation === 'add' || operation === 'inventory') && <label>Best before <input name="date" type="date" /></label>}
        <label>Location <select name="location" defaultValue=""><option value="">Default product location</option>{resource.data.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
        <button disabled={action.busy || resource.loading}>Save</button><button type="button" onClick={() => setSelected('')}>Close</button>
      </form>}</>}
  </section>
}
