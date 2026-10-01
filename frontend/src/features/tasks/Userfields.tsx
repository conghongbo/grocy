import type { Field } from '../../api/tasks'
import { context, t } from '../../app/context'
export function Userfields({ fields, values, change, files, fileChange, editing }: {
  fields: Field[]; values: Record<string, string>; change: (name: string, value: string) => void
  files: Record<string, File>; fileChange: (name: string, file?: File) => void; editing: boolean
}) {
  return <>{fields.map(field => {
    const value = values[field.name] ?? ''
    const id = `pilot-field-${field.id}`
    const required = Number(field.input_required) === 1
    const common = { id, className: 'form-control', required, value, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => change(field.name, e.target.value) }
    let control
    if (field.type === 'checkbox') control = <select {...common} required={required && !editing}><option value="">{t('Please select')}</option><option value="0">{t('No')}</option><option value="1">{t('Yes')}</option></select>
    else if (field.type === 'text-multi-line') control = <textarea {...common} rows={4} />
    else if (field.type.startsWith('preset-')) control = <select {...common} multiple={field.type === 'preset-checklist'} value={field.type === 'preset-checklist' ? value ? value.split(',') : [] : value} onChange={e => change(field.name, field.type === 'preset-checklist' ? Array.from(e.target.selectedOptions, option => option.value).join(',') : e.target.value)}>{field.type === 'preset-list' && <option value="" />}{(field.config ?? '').split(/\r\n|\r|\n/).map(option => <option key={option} value={option}>{option}</option>)}</select>
    else if (field.type === 'link-with-title') {
      let data = { title: '', link: '' }; try { data = JSON.parse(value || '{}') } catch { /* Keep malformed legacy values until edited. */ }
      control = <div><input className="form-control" aria-label={`${field.caption}: ${t('Title')}`} required={required} value={data.title ?? ''} onChange={e => change(field.name, JSON.stringify({ ...data, title: e.target.value }))} /><input id={id} className="form-control" aria-label={`${field.caption}: ${t('Link')}`} required={required} value={data.link ?? ''} onChange={e => change(field.name, JSON.stringify({ ...data, link: e.target.value }))} /></div>
    } else if (field.type === 'file' || field.type === 'image') control = <div><input id={id} type="file" className="form-control" required={required && !value} onChange={e => fileChange(field.name, e.target.files?.[0])} />{files[field.name] && <span>{files[field.name].name}</span>}{value && <a href={`${context.apiBase}/files/userfiles/${encodeURIComponent(value)}`} target="_blank" rel="noreferrer">{t('Show')}</a>}<button type="button" onClick={() => { change(field.name, ''); fileChange(field.name) }}>{t('Delete')}</button></div>
    else control = <input {...common} type={field.type === 'date' ? 'date' : field.type === 'datetime' ? 'datetime-local' : field.type.startsWith('number-') ? 'number' : 'text'} min={field.type.startsWith('number-') ? 0 : undefined} step={field.type === 'number-integral' ? 1 : field.type.startsWith('number-') ? '0.0001' : undefined} value={field.type === 'datetime' ? value.replace(' ', 'T') : value} onChange={e => change(field.name, field.type === 'datetime' ? e.target.value.replace('T', ' ') : e.target.value)} />
    return <div className="form-group" key={field.id}><label htmlFor={id}>{field.caption}{field.type === 'number-currency' ? ` (${context.currency})` : ''}</label>{control}</div>
  })}</>
}
