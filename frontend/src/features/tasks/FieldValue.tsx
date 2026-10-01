import type { Field } from '../../api/tasks'
import { context, t } from '../../app/context'
function safeLink(value: string) {
  try { const url = new URL(value, window.location.href); return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : undefined } catch { return undefined }
}
export function FieldValue({ field, value }: { field: Field; value: string }) {
  if (!value) return null
  if (field.type === 'checkbox') return Number(value) ? <span aria-label={t('Yes')}>✓</span> : null
  if (field.type === 'preset-checklist') return <>{value.split(',').map(part => <div key={part}>{part}</div>)}</>
  if (field.type === 'link') return <a href={safeLink(value)} target="_blank" rel="noreferrer">{value}</a>
  if (field.type === 'link-with-title') {
    let link: { title: string; link: string }
    try { link = JSON.parse(value) } catch { return value }
    return <a href={safeLink(link.link)} target="_blank" rel="noreferrer">{link.title}</a>
  }
  if (['file', 'image'].includes(field.type)) {
    let name = value; try { name = atob(value.split('_')[1]) } catch { /* Legacy malformed names remain visible. */ }
    const src = `${context.apiBase}/files/userfiles/${encodeURIComponent(value)}`
    return <a href={src} target="_blank" rel="noreferrer">{field.type === 'image' ? <img src={`${src}?force_serve_as=picture&best_fit_width=32&best_fit_height=32`} alt={name} loading="lazy" /> : name}</a>
  }
  if (field.type.startsWith('number-') && Number.isFinite(Number(value))) return <>{Number(value).toLocaleString(context.locale.replace('_', '-'), { maximumFractionDigits: 4 })}{field.type === 'number-currency' ? ` ${context.currency}` : ''}</>
  return <>{value}</>
}
