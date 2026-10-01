import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { context, route, t } from '../../app/context'
import { api, list, mutate, rows } from '../../api/tasks'
import type { Task, Category, User, Field } from '../../api/tasks'
import { FieldValue } from './FieldValue'
import { dueStatus, matchesStatus, localTimestamp } from './status'
import { decodeLayout, encodeLayout } from './layout'
import type { Layout } from './layout'
const labels: Record<string, string> = { overdue: 'Overdue', duetoday: 'Due today', duesoon: 'Due soon', normal: 'Upcoming', done: 'Done', '': 'Not scheduled' }
export function Overview({ category }: { category: boolean }) {
  const entity = category ? 'task_categories' : 'tasks'
  const tableId = category ? 'taskcategories-table' : 'tasks-table'
  const [items, setItems] = useState<(Task | Category)[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users] = useState<User[]>(context.users)
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [notice, setNotice] = useState('')
  const [undoId, setUndoId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [assigned, setAssigned] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const params = new URLSearchParams(window.location.search)
  const include = params.has(category ? 'include_disabled' : 'include_done')
  const settingKey = `datatables_state_${tableId}`
  const [layout, setLayout] = useState<Layout>(() => {
    return decodeLayout(context.settings[settingKey])
  })
  const groupKey = `datatables_rowGroup_${tableId}`
  const [group, setGroup] = useState<number | null>(() => {
    try { const stored = JSON.parse(String(context.settings[groupKey] ?? '{}')); return stored.enable ? Number(stored.dataSrc) === 6 && !category ? 3 : Number(stored.dataSrc) : null } catch { return null }
  })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  async function saveGroup(value: number | null) {
    setGroup(value)
    try { await mutate(`user/settings/${groupKey}`, 'PUT', { value: JSON.stringify(value === null ? { enable: false } : { enable: true, dataSrc: !category && value === 3 ? 6 : value }) }) }
    catch (e) { setError(String((e as Error).message)) }
  }
  const [options, setOptions] = useState(false)
  const days = Number(context.settings.tasks_due_soon_days) || 0
  const refresh = useCallback(async (signal?: AbortSignal) => {
    let records: (Task | Category)[]
    if (category) records = await list<Category>(entity, '', signal)
    else if (include) records = await list<Task>(entity, '', signal)
    else {
      const [current, objects] = await Promise.all([api<unknown>('tasks', { signal }), list<Task>('tasks', '?query[]=done=0', signal)])
      const values = new Map(objects.map(task => [Number(task.id), task.userfields]))
      records = rows<Task>(current).map(task => ({ ...task, userfields: values.get(Number(task.id)) }))
    }
    setItems(records)
  }, [category, entity, include])
  useEffect(() => {
    const abort = new AbortController()
    Promise.all([
      (async () => { await refresh(abort.signal) })(),
      list<Field>('userfields', `?query[]=entity=${entity}`, abort.signal).then(definitions => setFields(definitions.sort((a, b) => Number(a.sort_number) - Number(b.sort_number) || a.name.localeCompare(b.name)))),
      ...(category ? [] : [list<Category>('task_categories', '', abort.signal).then(setCategories)]),
    ]).catch(e => { if (!abort.signal.aborted) setError(String(e.message)) }).finally(() => { if (!abort.signal.aborted) setLoading(false) })
    return () => abort.abort()
  }, [category, entity, refresh]) // Server navigation changes include flags; each page gets a fresh mount.
  async function action(item: Task | Category, operation: 'complete' | 'undo' | 'delete') {
    if (lock.current) return
    if (operation === 'delete' && !window.confirm(t(category ? 'Are you sure you want to delete task category "%s"?' : 'Are you sure you want to delete task "%s"?', item.name))) return
    lock.current = true; setBusy(true); setError(''); setNotice('')
    try {
      await mutate(operation === 'delete' ? `objects/${entity}/${item.id}` : `tasks/${item.id}/${operation}`, operation === 'delete' ? 'DELETE' : 'POST', operation === 'complete' ? { done_time: localTimestamp() } : {})
      setNotice(t(operation === 'complete' ? 'Done' : operation === 'undo' ? 'Undo' : 'Delete') + ': ' + item.name)
      setUndoId(operation === 'complete' ? Number(item.id) : null)
      if (operation === 'delete') setItems(current => current.filter(row => row.id !== item.id))
      else setItems(current => current.map(row => row.id === item.id ? { ...row, done: operation === 'complete' ? 1 : 0 } : row))
      try { await refresh() } catch (e) { setError(`${t('Saved')}. ${String((e as Error).message)}`) }
    } catch (e) { setError(String((e as Error).message)) }
    finally { lock.current = false; setBusy(false) }
  }
  async function saveLayout(next: Layout) {
    setLayout(next)
    try { await mutate(`user/settings/${settingKey}`, 'PUT', { value: encodeLayout(next) }) }
    catch (e) { setError(String((e as Error).message)) }
  }
  const fieldColumns = fields.filter(f => Number(f.show_as_column_in_tables) === 1)
  const columns = category ? [t('Actions'), t('Name'), t('Description')] : [t('Actions'), t('Name'), t('Due'), t('Category'), t('Assigned to'), 'status', 'user']
  columns.push(...fieldColumns.map(f => f.caption))
  const indices = Array.from({ length: columns.length }, (_, i) => i)
  const order = [...(layout.ColReorder ?? []).filter(i => indices.includes(i)), ...indices.filter(i => !layout.ColReorder?.includes(i))]
  const visible = order.filter(i => !(!category && (i === 5 || i === 6)) && layout.columns?.[i]?.visible !== false)
  const categoryName = (id: number | null) => categories.find(c => Number(c.id) === Number(id))?.name ?? t('Uncategorized')
  const userName = (id: number | null) => users.find(u => Number(u.id) === Number(id))?.display_name || users.find(u => Number(u.id) === Number(id))?.username || ''
  function cellText(item: Task | Category, index: number): string {
    if (index === 1) return item.name
    if (category && index === 2) return item.description ?? ''
    if (!category) {
      const task = item as Task
      if (index === 2) return task.due_date ?? ''
      if (index === 3) return categoryName(task.category_id)
      if (index === 4) return userName(task.assigned_to_user_id)
    }
    const field = fieldColumns[index - (category ? 3 : 7)]
    return field ? item.userfields?.[field.name] ?? '' : ''
  }
  const filtered = items.filter(item => {
    if (category) { if (!include && !Number((item as Category).active)) return false }
    else {
      const task = item as Task
      if (!include && Number(task.done)) return false
      if (!matchesStatus(Number(task.done) ? 'done' : dueStatus(task.due_date, days), status)) return false
      if (assigned && Number(task.assigned_to_user_id) !== Number(assigned)) return false
      if (selectedCategory === 'none' && task.category_id) return false
      if (selectedCategory && selectedCategory !== 'none' && Number(task.category_id) !== Number(selectedCategory)) return false
    }
    return !search || [...indices.map(i => cellText(item, i)), item.description ?? ''].join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase())
  }).sort((a, b) => {
    if (group !== null) { const comparison = cellText(a, group).localeCompare(cellText(b, group)); if (comparison) return comparison }
    const [column, direction] = layout.order?.[0] ?? [category ? 1 : 2, 'asc']
    return cellText(a, column).localeCompare(cellText(b, column), context.locale.replace('_', '-'), { numeric: true }) * (direction === 'desc' ? -1 : 1)
  })
  const can = (permission: string) => context.permissions[permission]
  const linkBase = category ? '/taskcategory/' : '/task/'
  function clear() { setSearch(''); setStatus(''); setAssigned(''); setSelectedCategory('') }
  return <section aria-busy={loading || busy}>
    <div className="pilot-actions"><h2>{t(category ? 'Task categories' : 'Tasks')}</h2>
      {can('MASTER_DATA_EDIT') && <a className="btn btn-primary show-as-dialog-link" href={route(`${linkBase}new?embedded`)}>{t('Add')}</a>}
      <a className="btn btn-outline-secondary" href={route(`/userfields?entity=${entity}`)}>{t('Configure userfields')}</a>
      {!category && <a className="btn btn-outline-secondary" href={route('/taskcategories')}>{t('Task categories')}</a>}
    </div>
    {error && <div role="alert" className="alert alert-danger">{error}</div>}
    {notice && <div role="status" className="alert alert-success">{notice} {undoId !== null && can('TASKS_UNDO_EXECUTION') && <button disabled={busy} onClick={() => void action({ id: undoId, name: notice } as Task, 'undo')}>{t('Undo')}</button>}</div>}
    {!category && <div className="pilot-summary">{['overdue', 'duetoday', 'duesoon'].map(key => <button className="btn btn-outline-info" key={key} onClick={() => setStatus(key)}>{t(labels[key])}: {items.filter(item => !Number((item as Task).done) && matchesStatus(dueStatus((item as Task).due_date, days), key)).length}</button>)}</div>}
    <div className="pilot-filters">
      <input aria-label={t('Search')} className="form-control" value={search} placeholder={t('Search')} onChange={e => setSearch(e.target.value)} />
      {!category && <><select aria-label={t('Status')} className="form-control" value={status} onChange={e => setStatus(e.target.value)}><option value="">{t('All')}</option>{Object.entries(labels).filter(([key]) => key).map(([key, label]) => <option key={key} value={key}>{t(label)}</option>)}</select>
        <select aria-label={t('Category')} className="form-control" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}><option value="">{t('All')}</option><option value="none">{t('Uncategorized')}</option>{categories.filter(c => Number(c.active)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select aria-label={t('Assigned to')} className="form-control" value={assigned} onChange={e => setAssigned(e.target.value)}><option value="">{t('All')}</option>{users.map(u => <option key={u.id} value={u.id}>{userName(u.id)}</option>)}</select></>}
      <label><input type="checkbox" checked={include} onChange={e => { window.location.href = route(`/${category ? 'taskcategories' : 'tasks'}${e.target.checked ? category ? '?include_disabled' : '?include_done' : ''}`) }} /> {t(category ? 'Show disabled' : 'Show done tasks')}</label>
      <button className="btn btn-outline-info" onClick={clear}>{t('Clear filter')}</button>
      <button className="btn btn-outline-secondary" onClick={() => setOptions(!options)}>{t('Table options')}</button>
    </div>
    {options && <fieldset><legend>{t('Table options')}</legend><label>{t('Group by')} <select value={group ?? ''} onChange={e => void saveGroup(e.target.value === '' ? null : Number(e.target.value))}><option value="">{t('None')}</option>{indices.filter(i => category ? i >= 3 : [2, 3, 4].includes(i) || i >= 7).map(i => <option key={i} value={i}>{columns[i]}</option>)}</select></label>{order.filter(i => category || ![5, 6].includes(i)).map((i, position) => <div key={i}><label><input type="checkbox" checked={layout.columns?.[i]?.visible !== false} onChange={e => { const next = indices.map(n => ({ visible: layout.columns?.[n]?.visible !== false })); next[i].visible = e.target.checked; void saveLayout({ ...layout, columns: next }) }} /> {columns[i]}</label> <button disabled={!position} onClick={() => { const next = [...order]; [next[position - 1], next[position]] = [next[position], next[position - 1]]; void saveLayout({ ...layout, ColReorder: next }) }}>↑</button></div>)}</fieldset>}
    {loading ? <p role="status">{t('Loading...')}</p> : <><div className="table-responsive"><table id={`react-${tableId}`} className="table table-striped"><thead><tr>{visible.map(i => <th key={i}><button className="btn btn-link" onClick={() => void saveLayout({ ...layout, order: [[i, layout.order?.[0]?.[0] === i && layout.order[0][1] === 'asc' ? 'desc' : 'asc']] })}>{columns[i]}</button></th>)}</tr></thead><tbody>{filtered.map((item, rowIndex) => <Fragment key={item.id}>{group !== null && (rowIndex === 0 || cellText(filtered[rowIndex - 1], group) !== cellText(item, group)) && <tr><td colSpan={visible.length}><button aria-expanded={!collapsed[cellText(item, group)]} onClick={() => setCollapsed(current => ({ ...current, [cellText(item, group)]: !current[cellText(item, group)] }))}>{cellText(item, group)} {collapsed[cellText(item, group)] ? '+' : '−'}</button></td></tr>}<tr hidden={group !== null && collapsed[cellText(item, group)]} className={category ? !Number((item as Category).active) ? 'text-muted' : '' : Number((item as Task).done) ? 'text-muted' : ({ overdue: 'table-danger', duetoday: 'table-info', duesoon: 'table-warning' }[dueStatus((item as Task).due_date, days)] ?? '')}>{visible.map(i => <td key={i}>{i === 0 ? <div className="pilot-actions">{!category && <>{!Number((item as Task).done) && can('TASKS_MARK_COMPLETED') && <button className="btn btn-success btn-sm" disabled={busy} onClick={() => void action(item, 'complete')}>{t('Mark as done')}</button>}{Number((item as Task).done) !== 0 && can('TASKS_UNDO_EXECUTION') && <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => void action(item, 'undo')}>{t('Undo')}</button>}</>}{can('MASTER_DATA_EDIT') && <a className="btn btn-info btn-sm show-as-dialog-link" href={route(`${linkBase}${item.id}?embedded`)}>{t('Edit')}</a>}{can('MASTER_DATA_EDIT') && <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => void action(item, 'delete')}>{t('Delete')}</button>}</div> : <>{i >= (category ? 3 : 7) ? <FieldValue field={fieldColumns[i - (category ? 3 : 7)]} value={cellText(item, i)} /> : cellText(item, i)}{i === 1 && !category && <div className="small pilot-description">{item.description}</div>}{i === 2 && !category && <div className="small">{t(labels[Number((item as Task).done) ? 'done' : dueStatus((item as Task).due_date, days)])}</div>}</>}</td>)}</tr></Fragment>)}</tbody></table></div>{!filtered.length && <p role="status">{t('No tasks found')} <button onClick={clear}>{t('Clear filter')}</button></p>}</>}
  </section>
}
