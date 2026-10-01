export interface Bootstrap {
  page: 'tasks' | 'taskcategories' | 'taskform' | 'taskcategoryform'
  apiBase: string; routeBase: string; resourceBase: string
  users: { id: number; username: string; display_name?: string }[]; featureFlags: { tasks: boolean }
  userId: number; permissions: Record<string, boolean>
  settings: Record<string, unknown>; locale: string; currency: string
  embedded: boolean; objectId: number | null
}
export function readBootstrap(): Bootstrap {
  const value = JSON.parse(document.getElementById('grocy-react-bootstrap')?.textContent ?? '{}')
  if (!['tasks', 'taskcategories', 'taskform', 'taskcategoryform'].includes(value.page) || typeof value.apiBase !== 'string' || typeof value.routeBase !== 'string') throw new Error('Invalid Grocy page context')
  return value as Bootstrap
}
export const context = readBootstrap()
export const route = (path: string) => context.routeBase + path
// The existing gettext implementation preserves Grocy's catalogs and placeholder rules.
declare global {
  interface Window { __t: (text: string, ...args: unknown[]) => string; WindowMessageBag: (message: string, payload?: unknown) => unknown }
}
export const t = (text: string, ...args: unknown[]) => window.__t(text, ...args)
