import { useState } from 'react'
import { grocy } from '../api/grocy'
import { configuration } from '../api/client'
import { useAction, useResource } from '../components/Resource'
type Kind = 'tasks' | 'chores' | 'batteries'
interface Row { id: string; name: string; due: string | null; detail: string; chargeable?: boolean }
const loaders: Record<Kind, (signal: AbortSignal) => Promise<Row[]>> = {
  tasks: async signal => (await grocy.tasks(signal)).map(t => ({ id: String(t.id), name: t.name, due: t.due_date, detail: [t.category?.name, t.assigned_to_user?.username].filter(Boolean).join(' · ') })),
  chores: async signal => (await grocy.chores(signal)).map(c => ({ id: String(c.chore_id), name: c.chore_name, due: c.next_estimated_execution_time, detail: `Last tracked: ${c.last_tracked_time ?? 'never'}${c.next_execution_assigned_user ? ' · ' + c.next_execution_assigned_user.username : ''}` })),
  batteries: async signal => (await grocy.batteries(signal)).map(b => ({ id: String(b.battery_id), name: b.battery.name, due: b.next_estimated_charge_time, detail: `Last charged: ${b.last_tracked_time ?? 'never'}`, chargeable: Number(b.battery.rechargeable) === 1 })),
}
export default function ActivityPage({ kind }: { kind: Kind }) {
  const resource = useResource(loaders[kind])
  const action = useAction(resource.refresh)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Row>()
  const legacy = kind === 'chores' ? 'choresoverview' : kind === 'batteries' ? 'batteriesoverview' : 'tasks'
  return <section><h1>{kind[0].toUpperCase() + kind.slice(1)}</h1>
    <p><a href={`${configuration.legacyUrl}/${legacy}`}>Manage records and advanced workflows</a></p>
    <label>Search <input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label><button onClick={resource.refresh} disabled={resource.loading}>Refresh</button>
    {resource.loading && <p role="status">Loading…</p>}{resource.error && <p role="alert" className="error">{resource.error}</p>}{action.feedback}
    <div className="table-scroll"><table><thead><tr><th>Name</th><th>Due</th><th>Details</th><th>Action</th></tr></thead><tbody>
      {resource.data?.filter(r => r.name.toLowerCase().includes(query.toLowerCase())).map(row => <tr key={row.id}><th scope="row">{row.name}</th><td>{row.due ?? '—'}</td><td>{row.detail}</td><td>
        <button disabled={action.busy || (kind === 'batteries' && !row.chargeable)} onClick={() => {
          if (kind === 'tasks') void action.run(() => grocy.complete(row.id), () => grocy.undoTask(row.id))
          else setSelected(row)
        }}>{kind === 'tasks' ? 'Complete' : kind === 'chores' ? 'Track execution' : 'Track charge'}</button>
      </td></tr>)}
    </tbody></table></div>{resource.data?.length === 0 && <p>No current records.</p>}
    {selected && <form onSubmit={e => {
      e.preventDefault(); const data = new FormData(e.currentTarget)
      const body = { ...(data.get('time') ? { tracked_time: String(data.get('time')).replace('T', ' ') + ':00' } : {}), skipped: data.get('skipped') === 'on' }
      let executionId: string | number | undefined
      void action.run(async () => {
        const result = kind === 'chores' ? await grocy.execute(selected.id, body) : await grocy.charge(selected.id, body)
        executionId = result.id; setSelected(undefined)
      }, async () => {
        if (executionId === undefined) throw new Error('The server did not return an execution ID.')
        return kind === 'chores' ? grocy.undoChore(executionId) : grocy.undoCharge(executionId)
      })
    }}><h2>{selected.name}</h2><label>Time (leave blank for server time) <input name="time" type="datetime-local" /></label>
      {kind === 'chores' && <label><input name="skipped" type="checkbox" /> Skip execution</label>}
      <button disabled={action.busy}>Save</button><button type="button" onClick={() => setSelected(undefined)}>Cancel</button>
    </form>}
  </section>
}
