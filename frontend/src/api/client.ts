export interface Configuration { apiUrl: string; legacyUrl: string; features?: Record<string, boolean> }
declare global { interface Window { grocyReact?: Configuration } }
export const configuration = (typeof window !== 'undefined' ? window.grocyReact : undefined) ?? { apiUrl: '/api', legacyUrl: '' }
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${configuration.apiUrl}${endpoint}`, { ...options, headers, credentials: 'same-origin' })
  const text = await response.text()
  let body: unknown
  try { body = text ? JSON.parse(text) : undefined } catch { throw new ApiError(response.status, 'Unexpected server response. Check your login and server configuration.') }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error_message' in body ? String(body.error_message) : `Request failed (${response.status})`
    throw new ApiError(response.status, response.status === 401 ? 'Your session expired. Sign in through the legacy interface.' : message)
  }
  return body as T
}
export const post = <T,>(endpoint: string, body: unknown = {}) => apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) })
