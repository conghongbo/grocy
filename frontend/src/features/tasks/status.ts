export function localDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export function dueStatus(due: string | null, days: number, now = new Date()): string {
  if (!due) return ''
  const date = due.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return ''
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime()) || localDate(parsed) !== date) return ''
  const today = localDate(now)
  if (date < today) return 'overdue'
  if (date === today) return 'duetoday'
  const end = new Date(now); end.setDate(end.getDate() + days)
  return days > 0 && date <= localDate(end) ? 'duesoon' : 'normal'
}
export const matchesStatus = (actual: string, filter: string) => !filter || actual === filter || (filter === 'duesoon' && actual === 'duetoday')

export function localTimestamp(now = new Date()): string {
  return `${localDate(now)} ${[now.getHours(), now.getMinutes(), now.getSeconds()].map(value => String(value).padStart(2, '0')).join(':')}`
}
