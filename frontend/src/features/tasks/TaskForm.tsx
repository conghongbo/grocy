import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { context, t } from '../../app/context'
import { api, list, mutate } from '../../api/tasks'
import type { Task, Category, User, Field } from '../../api/tasks'
import { finishForm } from '../../compat/forms'
import { localDate } from './status'
import { Userfields } from './Userfields'
export function TaskForm({ category }: { category: boolean }) {
  const entity = category ? 'task_categories' : 'tasks'
  const [record, setRecord] = useState({ name: '', description: '', due_date: '', category_id: '', assigned_to_user_id: String(context.userId), active: 1 })
  const [categories, setCategories] = useState<Category[]>([])
  const [users] = useState<User[]>(context.users)
  const [fields, setFields] = useState<Field[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [dirty, setDirtyState] = useState(false)
  const dirtyRef = useRef(false)
  const setDirty = (value: boolean) => { dirtyRef.current = value; setDirtyState(value) }
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const savedId = useRef<number | null>(context.objectId)
  const oldValues = useRef<Record<string, string>>({})
  const uploaded = useRef<Record<string, { file: File; value: string }>>({})
  const [error, setError] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)
  useEffect(() => {
    const abort = new AbortController()
    async function load() {
      const definitions = await list<Field>('userfields', `?query[]=entity=${entity}`, abort.signal)
      setFields(definitions.sort((a, b) => Number(a.sort_number) - Number(b.sort_number) || a.name.localeCompare(b.name)))
      const initial: Record<string, string> = {}
      for (const field of definitions) initial[field.name] = field.default_value === 'now' ? field.type === 'date' ? localDate() : `${localDate()} ${new Date().toTimeString().slice(0, 8)}` : field.default_value ?? ''
      if (context.objectId) {
        const object = await api<Task & Category>(`objects/${entity}/${context.objectId}`, { signal: abort.signal })
        setRecord({ name: object.name, description: object.description ?? '', due_date: object.due_date?.slice(0, 10) ?? '', category_id: object.category_id ? String(object.category_id) : '', assigned_to_user_id: object.assigned_to_user_id ? String(object.assigned_to_user_id) : '', active: Number(object.active) })
        const userfields = await api<Record<string, string | null>>(`userfields/${entity}/${context.objectId}`, { signal: abort.signal })
        for (const [name, value] of Object.entries(userfields)) initial[name] = value ?? ''
      }
      oldValues.current = context.objectId ? { ...initial } : {}
      setValues(initial)
      if (!category) {
        setCategories(await list<Category>('task_categories', '?query[]=active=1', abort.signal))
      }
    }
    load().catch(e => { if (!abort.signal.aborted) { setLoadFailed(true); setError(String(e.message)) } }).finally(() => { if (!abort.signal.aborted) setLoading(false) })
    return () => abort.abort()
  }, [category, entity])
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current || !event.currentTarget.reportValidity()) return
    const another = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'another'
    lock.current = true; setBusy(true); setError('')
    try {
      const body = category ? { name: record.name, description: record.description, active: record.active } : { name: record.name, description: record.description, due_date: record.due_date, category_id: record.category_id || null, assigned_to_user_id: record.assigned_to_user_id || null }
      if (savedId.current === null) savedId.current = Number((await mutate<{ created_object_id: number }>(`objects/${entity}`, 'POST', body)).created_object_id)
      else await mutate(`objects/${entity}/${savedId.current}`, 'PUT', body)
      const payload = { ...values }
      for (const [name, file] of Object.entries(files)) {
        const previous = uploaded.current[name]
        if (previous?.file === file) { payload[name] = previous.value; continue }
        const filename = `${crypto.randomUUID()}.${file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin'}`
        await api(`files/userfiles/${encodeURIComponent(btoa(filename))}`, { method: 'PUT', body: file, headers: { 'Content-Type': 'application/octet-stream' } })
        const safeName = file.name.replace(/[^a-zA-Z0-9._ -]/g, '_')
        payload[name] = `${btoa(filename)}_${btoa(safeName)}`
        uploaded.current[name] = { file, value: payload[name] }
      }
      if (fields.length) await mutate(`userfields/${entity}/${savedId.current}`, 'PUT', payload)
      for (const field of fields.filter(field => ['file', 'image'].includes(field.type))) {
        const old = oldValues.current[field.name]
        if (old && old !== payload[field.name]) {
          await mutate(`files/userfiles/${encodeURIComponent(old.split('_')[0])}`, 'DELETE')
          delete oldValues.current[field.name]
        }
      }
      setDirty(false)
      // React state flushes after this turn; remove legacy auto-reload marker immediately.
      document.querySelector('#grocy-react-root form')?.classList.remove('is-dirty')
      finishForm(category, another)
    } catch (e) { setError(`${savedId.current && !context.objectId ? `${t('Saved')} (#${savedId.current}). ` : ''}${String((e as Error).message)}`) }
    finally { lock.current = false; setBusy(false) }
  }
  function change(name: keyof typeof record, value: string | number) { setRecord(current => ({ ...current, [name]: value })); setDirty(true) }
  if (loading) return <p role="status">{t('Loading...')}</p>
  if (loadFailed) return <p role="alert">{error} <button onClick={() => window.location.reload()}>{t('Retry')}</button></p>
  if (!context.permissions.MASTER_DATA_EDIT) return <p role="alert">{t('Permission missing')}</p>
  const title = category ? context.objectId ? 'Edit task category' : 'Create task category' : context.objectId ? 'Edit task' : 'Create task'
  return <section><h2>{t(title)}</h2>{error && <p className="alert alert-danger" role="alert">{error}</p>}<form className={`pilot-form ${dirty ? 'is-dirty' : ''}`} onSubmit={event => void save(event)}>
    <fieldset disabled={busy}>
      <div className="form-group"><label htmlFor="pilot-name">{t('Name')}</label><input id="pilot-name" className="form-control" required autoFocus value={record.name} onChange={e => change('name', e.target.value)} /></div>
      <div className="form-group"><label htmlFor="pilot-description">{t('Description')}</label><textarea id="pilot-description" className="form-control" value={record.description} onChange={e => change('description', e.target.value)} /></div>
      {category ? <label><input type="checkbox" checked={!!record.active} onChange={e => change('active', e.target.checked ? 1 : 0)} /> {t('Active')}</label> : <>
        <div className="form-group"><label htmlFor="pilot-due">{t('Due')}</label><input id="pilot-due" className="form-control" type="date" value={record.due_date} onInput={e => change('due_date', e.currentTarget.value)} onChange={e => change('due_date', e.target.value)} /></div>
        <div className="form-group"><label htmlFor="pilot-category">{t('Category')}</label><select id="pilot-category" className="form-control" value={record.category_id} onChange={e => change('category_id', e.target.value)}><option value="" />{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="form-group"><label htmlFor="pilot-user">{t('Assigned to')}</label><select id="pilot-user" className="form-control" value={record.assigned_to_user_id} onChange={e => change('assigned_to_user_id', e.target.value)}><option value="" />{users.map(u => <option key={u.id} value={u.id}>{u.display_name || u.username}</option>)}</select></div>
      </>}
      <Userfields fields={fields} values={values} files={files} editing={!!context.objectId} change={(name, value) => { setValues(current => ({ ...current, [name]: value })); setDirty(true) }} fileChange={(name, file) => { setFiles(current => { const next = { ...current }; if (file) next[name] = file; else delete next[name]; return next }); setDirty(true) }} />
      <div className="pilot-actions"><button className="btn btn-success" type="submit">{t(context.objectId || category ? 'Save' : 'Save & close')}</button>{!context.objectId && !category && <button className="btn btn-primary" type="submit" value="another">{t('Save & add another task')}</button>}</div>
    </fieldset>
  </form></section>
}
